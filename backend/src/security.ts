import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from './types/index.js';

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const PASSWORD_KEY_LENGTH = 64;
const TOKEN_SECRET = process.env.JWT_SECRET || 'mediwise_development_fallback_jwt_secret_32_characters_minimum';

if (!TOKEN_SECRET || TOKEN_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET must contain at least 32 characters.');
}

interface TokenPayload {
  sub: string;
  role: UserRole;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  auth?: Pick<TokenPayload, 'sub' | 'role'>;
}

const encodeBase64Url = (value: string): string => Buffer.from(value).toString('base64url');

export const signToken = (payload: TokenPayload): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
};

export const verifyToken = (token: string): TokenPayload | null => {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;
  const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as TokenPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
};

export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${derived}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [algorithm, salt, expected] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expected) return false;
  const derived = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex');
  return derived.length === expected.length && crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(expected));
};

export const generateCsrfToken = (): string => crypto.randomBytes(24).toString('hex');

export const issueSession = (res: Response, userId: string, role: UserRole): void => {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = signToken({ sub: userId, role, exp: now + ACCESS_TOKEN_TTL_SECONDS });
  const refreshToken = signToken({ sub: userId, role, exp: now + REFRESH_TOKEN_TTL_SECONDS });
  const csrfToken = generateCsrfToken();
  const secure = process.env.NODE_ENV === 'production';

  res.cookie('mediwise_access', accessToken, { httpOnly: true, secure, sameSite: 'strict', maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000, path: '/' });
  res.cookie('mediwise_refresh', refreshToken, { httpOnly: true, secure, sameSite: 'strict', maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000, path: '/api/auth' });
  // Readable by client script to send back in X-CSRF-Token header
  res.cookie('mediwise_csrf', csrfToken, { httpOnly: false, secure, sameSite: 'strict', maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000, path: '/' });
};

export const clearSession = (res: Response): void => {
  res.clearCookie('mediwise_access', { path: '/' });
  res.clearCookie('mediwise_refresh', { path: '/api/auth' });
  res.clearCookie('mediwise_csrf', { path: '/' });
};

export const getCookie = (req: Request, name: string): string | null => {
  const target = `${name}=`;
  return req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(target))?.slice(target.length) ?? null;
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = getCookie(req, 'mediwise_access');
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Authentication is required.' });
    return;
  }
  req.auth = { sub: payload.sub, role: payload.role };
  next();
};

export const requireRole = (...roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    res.status(403).json({ error: 'You do not have permission to access this resource.' });
    return;
  }
  next();
};

/**
 * CSRF Protection Middleware for state-mutating requests (POST, PUT, PATCH, DELETE).
 * Verifies the X-CSRF-Token or x-csrf-token header against the mediwise_csrf cookie.
 */
export const requireCsrf = (req: Request, res: Response, next: NextFunction): void => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  // Exempt auth bootstrap routes (signin/register) where user doesn't have an active session yet
  if (req.path === '/api/auth/signin' || req.path === '/api/auth/register') {
    next();
    return;
  }

  const cookieCsrf = getCookie(req, 'mediwise_csrf');
  const headerCsrf = req.headers['x-csrf-token'] as string | undefined;

  // If a cookie was issued, ensure the header matches
  if (cookieCsrf) {
    if (!headerCsrf || headerCsrf !== cookieCsrf) {
      res.status(403).json({ error: 'Invalid or missing CSRF token' });
      return;
    }
  }

  next();
};

export type { AuthenticatedRequest };
