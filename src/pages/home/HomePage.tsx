import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { usePlayer } from '../../context/PlayerContext';
import { ENDPOINTS, PAGES } from '../../constants';

const HomePage: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setPlayerId, setNickname: setGlobalNickname } = usePlayer();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleJoinLobby = async () => {
    if (!nickname) {
      setError('Nickname cannot be empty.');
      return;
    }

    try {
      const response: AxiosResponse<{ playerId: string }> = await axios.put(
        ENDPOINTS.JOIN_LOBBY,
        { nickname }
      );

      setPlayerId(response.data.playerId);
      setGlobalNickname(nickname);

      navigate(PAGES.ROOMS);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred. Please try again.'
      );
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Lobby</h1>
      <input
        type="text"
        value={nickname}
        onChange={handleInputChange}
        placeholder="Enter your nickname"
        style={{ padding: '10px', marginBottom: '10px' }}
      />
      <br />
      <button onClick={handleJoinLobby} style={{ padding: '10px' }}>
        Join Lobby
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default HomePage;
