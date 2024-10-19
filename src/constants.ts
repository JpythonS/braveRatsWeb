export const API_URL = 'https://ir1x3o3590.execute-api.sa-east-1.amazonaws.com';

export const ENDPOINTS = {
  ROOMS: `${API_URL}/rooms`,
  JOIN_ROOM: `${API_URL}/join-room`,
  JOIN_LOBBY: `${API_URL}/join-lobby`,
  ROOM_READY: (roomId: string) => `${API_URL}/room-ready/${roomId}`,
};

export const PAGES = {
  ROOMS: '/rooms',
  WAITING_ROOM: '/room/waiting',
  GAME_ROOM: (roomId: string) => `/game/${roomId}`,
};
