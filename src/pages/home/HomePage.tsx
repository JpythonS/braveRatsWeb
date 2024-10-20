import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { usePlayer } from "../../context/PlayerContext";
import { ENDPOINTS, PAGES } from "../../constants";
import { Button, Flex, Input, Text } from "@chakra-ui/react";

const HomePage: React.FC = () => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setPlayerId, setNickname: setGlobalNickname } = usePlayer();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleJoinLobby = async () => {
    if (!nickname) {
      setError("Nickname cannot be empty.");
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
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

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
        Game Lobby
      </Text>

      <Input
        variant="outline"
        width="260px"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={handleInputChange}
      />

      <br />
      <Button colorScheme="blue" mt="12px" onClick={handleJoinLobby}>
        Join Lobby
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Flex>
  );
};

export default HomePage;
