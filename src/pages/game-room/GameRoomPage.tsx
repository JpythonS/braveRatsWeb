import { useParams } from 'react-router-dom';

const GameRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div>
      <h1>Game Room</h1>
      <p>Welcome to the game room with ID: {roomId}</p>
      {/* Game logic goes here */}
    </div>
  );
};

export default GameRoomPage;
