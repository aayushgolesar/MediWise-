import type { Server } from 'socket.io';
import { initRealtime as initServerRealtime } from '../../server/realtime.js';

/** @deprecated Import from server/realtime.ts. Kept so existing imports keep working. */
export const initRealtime = (io: Server): void => {
  initServerRealtime(io);
};
