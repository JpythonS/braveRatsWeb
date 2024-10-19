import { usePlayer } from '../../context/PlayerContext';

import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../constants';

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { playerId } = usePlayer();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(ENDPOINTS.ROOMS);
        setRooms(response.data);
      } catch (err: any) {
        setError(
          'Error fetching rooms: ' +
            (err.response?.data?.message || err.message)
        );
      }
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await axios.post(ENDPOINTS.JOIN_ROOM, { roomId, playerId });
      navigate(`/waiting/${roomId}`);
    } catch (err: any) {
      setError(
        'Error joining room: ' + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleCreateRoom = async () => {
    const newRoomId = `room-${Math.floor(Math.random() * 10000)}`;
    try {
      const response: AxiosResponse<{ roomId: string }> = await axios.post(
        ENDPOINTS.JOIN_ROOM,
        {
          roomId: newRoomId,
          playerId,
        }
      );
      navigate(`/waiting/${response.data.roomId}`);
    } catch (err: any) {
      setError(
        'Error creating room: ' + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Available Rooms</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {rooms.map((room, index) => (
          <li key={room.id} style={{ margin: '10px 0' }}>
            <button
              onClick={() => handleJoinRoom(room.id)}
              style={{ padding: '10px' }}
            >
              Join Room {index + 1}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleCreateRoom}
        style={{ padding: '10px', marginTop: '20px' }}
      >
        Create Room
      </button>
    </div>
  );
};

export default RoomsPage;
