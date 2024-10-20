import { Box, Center, Spinner } from "@chakra-ui/react";
import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/home/HomePage'));
const RoomsPage = lazy(() => import('./pages/rooms/RoomsPage'));
const NotFoundPage = lazy(() => import('./pages/not-found/NotFoundPage'));
const WaitingRoomPage = lazy(() => import('./pages/waiting-room/WaitingRoomPage'));
const GameRoomPage = lazy(() => import('./pages/game-room/GameRoomPage'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={
        <Center height="100vh">
          <Box>
            <Spinner size="xl" />
            <Box mt={4}>Loading...</Box>
          </Box>
        </Center>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/waiting/:roomId" element={<WaitingRoomPage />} />{' '}
          <Route path="/game/:roomId" element={<GameRoomPage />} />{' '}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
