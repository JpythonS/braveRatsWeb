import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import RoomsPage from './pages/rooms/RoomsPage';
import NotFoundPage from './pages/not-found/NotFoundPage';
import WaitingRoomPage from './pages/waiting-room/WaitingRoomPage';
import GameRoomPage from './pages/game-room/GameRoomPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/waiting/:roomId" element={<WaitingRoomPage />} />{' '}
        <Route path="/game/:roomId" element={<GameRoomPage />} />{' '}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
