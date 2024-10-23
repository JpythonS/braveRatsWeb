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

export const GAME_STATUS = {
  ROUND_RESULT: "round-result",
  END_GAME: "endGame"
}


export const CARD_DESCRIPTION: { [key: number]: string } = {
  1: "Esta rodada termina em suspensão.",
  2: "Se seu oponente jogar o Príncipe, você automaticamente vence o jogo.",
  3: "Na próxima rodada, seu oponente revela a carta antes de você escolher a sua.",
  4: "A menor força vence.",
  5: "Se vencer com esta carta, conta como 2 vitórias.",
  6: "Copia a carta jogada pelo oponente na rodada anterior.",
  7: "Anula o poder especial da carta de seu oponente.",
  8: "A carta da sua próxima rodada recebe +2 de força.",
  9: "Você vence a rodada, exceto contra o Músico e a Princesa."
};

export const IMAGE_PATH = (color: string): { [key: number]: string } => ({
  1: `/dist/musico-${color}.png`,
  2: `/dist/princesa-${color}.png`,
  3: `/dist/espiao-${color}.png`,
  4: `/dist/assassino-${color}.png`,
  5: `/dist/embaixador-${color}.png`,
  6: `/dist/imitador-${color}.png`,
  7: `/dist/feiticeiro-${color}.png`,
  8: `/dist/general-${color}.png`,
  9: `/dist/principe-${color}.png`
})