import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ENDPOINTS, PAGES } from "../../constants";
import { Flex, Text } from "@chakra-ui/react";

const WaitingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkRoomStatus = async () => {
    if (!roomId) {
      setError("Room ID is not defined.");
      return;
    }

    try {
      const response = await axios.get(ENDPOINTS.ROOM_STATUS(roomId));
      if (response.data.ready) {
        setIsReady(true);
      }
    } catch (err: any) {
      setError(
        "Error checking room status: " +
        (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkRoomStatus();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [roomId]);

  useEffect(() => {
    if (isReady && roomId) {
      navigate(PAGES.GAME_ROOM(roomId));
    }
  }, [isReady, navigate, roomId]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="gray.900"
      color="white"
      minHeight="100vh"
    >
      <Text fontSize="40px" mb="16px">
        Waiting Room
      </Text>
      <Text>
        You are in the waiting room. Please wait for the game to start!
      </Text>
      {error && <Text colorScheme="red">{error}</Text>}
    </Flex>
  );
};

export default WaitingRoomPage;
