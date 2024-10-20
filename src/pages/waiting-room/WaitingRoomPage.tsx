import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS, PAGES } from '../../constants';

const WaitingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkRoomStatus = async () => {
    if (!roomId) {
      setError('Room ID is not defined.');
      return;
    }

    try {
      const response = await axios.get(ENDPOINTS.ROOM_STATUS(roomId));
      if (response.data.ready) {
        setIsReady(true);
      }
    } catch (err: any) {
      setError(
        'Error checking room status: ' +
          (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    // Poll every 5 seconds
    const intervalId = setInterval(() => {
      checkRoomStatus();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [roomId]);

  useEffect(() => {
    if (isReady && roomId) {
      navigate(PAGES.GAME_ROOM(roomId));
    }
  }, [isReady, navigate, roomId]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Waiting Room</h1>
      <p>You are in the waiting room. Please wait for the game to start!</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default WaitingRoomPage;
