export const API_URL = 'https://ir1x3o3590.execute-api.sa-east-1.amazonaws.com';

export const ENDPOINTS = {
  ROOMS: `${API_URL}/rooms`,
  JOIN_ROOM: `${API_URL}/join-room`,
  JOIN_LOBBY: `${API_URL}/join-lobby`,
  PLAY_ROUND: `${API_URL}/play-round`,
  VIEW_OPPONENT_MOVE: `${API_URL}/view-opponent-move`,
  ROOM_STATUS: (roomId: string) => `${API_URL}/room-status/${roomId}`,
  GAME_STATE: (roomId: string, playerId: string) => `${API_URL}/room-status/${roomId}?playerId=${playerId}`
};

export const PAGES = {
  ROOMS: '/rooms',
  WAITING_ROOM: '/room/waiting',
  GAME_ROOM: (roomId: string) => `/game/${roomId}`,
};
