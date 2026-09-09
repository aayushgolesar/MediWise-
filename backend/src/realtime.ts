import type { Server, Socket } from 'socket.io';

const ORDER_ROOM_PREFIX = 'order:';
const HUB_SLA_ROOM = 'hub:sla';
const SLA_WINDOW_SECONDS = 15 * 60;
const GPS_TICK_MS = 2_000;
const SLA_TICK_MS = 1_000;

interface GpsState {
  distanceKm: number;
  etaMinutes: number;
}

let ioRef: Server | null = null;
const gpsByOrder = new Map<string, GpsState>();
let slaRemainingSec = SLA_WINDOW_SECONDS;
let gpsTimer: ReturnType<typeof setInterval> | null = null;
let slaTimer: ReturnType<typeof setInterval> | null = null;

export const setRealtimeServer = (io: Server): void => {
  ioRef = io;
};

export const emitOrderUpdated = (orderId: string, status: string): void => {
  ioRef?.to(`${ORDER_ROOM_PREFIX}${orderId}`).emit('order_updated', { orderId, status, ts: Date.now() });
};

export const emitGpsUpdate = (orderId: string, payload: GpsState): void => {
  ioRef?.to(`${ORDER_ROOM_PREFIX}${orderId}`).emit('gps_update', payload);
};

export const emitSlaSync = (remainingSec: number): void => {
  ioRef?.to(HUB_SLA_ROOM).emit('sla_sync', { remainingSec, ts: Date.now() });
};

const ensureGpsState = (orderId: string): GpsState => {
  const existing = gpsByOrder.get(orderId);
  if (existing) return existing;
  const initial: GpsState = { distanceKm: 2.4, etaMinutes: 18 };
  gpsByOrder.set(orderId, initial);
  return initial;
};

const startLoops = (): void => {
  if (!gpsTimer) {
    gpsTimer = setInterval(() => {
      for (const [orderId, state] of gpsByOrder.entries()) {
        const nextDistance = state.distanceKm > 0.3 ? Number((state.distanceKm - 0.08).toFixed(2)) : 0.25;
        const nextEta = state.etaMinutes > 3 ? state.etaMinutes - 1 : 3;
        const next = { distanceKm: nextDistance, etaMinutes: nextEta };
        gpsByOrder.set(orderId, next);
        emitGpsUpdate(orderId, next);
      }
    }, GPS_TICK_MS);
  }

  if (!slaTimer) {
    slaTimer = setInterval(() => {
      slaRemainingSec = slaRemainingSec > 0 ? slaRemainingSec - 1 : SLA_WINDOW_SECONDS;
      emitSlaSync(slaRemainingSec);
    }, SLA_TICK_MS);
  }
};

export const initRealtime = (io: Server): void => {
  setRealtimeServer(io);
  startLoops();

  io.on('connection', (socket: Socket) => {
    socket.on('joinOrderRoom', (orderId: unknown) => {
      if (typeof orderId !== 'string' || !orderId.trim()) return;
      const room = `${ORDER_ROOM_PREFIX}${orderId.trim()}`;
      void socket.join(room);
      emitGpsUpdate(orderId.trim(), ensureGpsState(orderId.trim()));
    });

    socket.on('leaveOrderRoom', (orderId: unknown) => {
      if (typeof orderId !== 'string' || !orderId.trim()) return;
      void socket.leave(`${ORDER_ROOM_PREFIX}${orderId.trim()}`);
    });

    socket.on('joinHubSla', () => {
      void socket.join(HUB_SLA_ROOM);
      socket.emit('sla_sync', { remainingSec: slaRemainingSec, ts: Date.now() });
    });
  });
};
