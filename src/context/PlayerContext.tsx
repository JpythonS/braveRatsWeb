import { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerContextType {
  playerId: string | null;
  nickname: string | null;
  setPlayerId: (id: string | null) => void;
  setNickname: (name: string | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

  return (
    <PlayerContext.Provider
      value={{ playerId, nickname, setPlayerId, setNickname }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
