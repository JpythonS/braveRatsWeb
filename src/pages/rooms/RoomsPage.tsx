import { usePlayer } from "../../context/PlayerContext";

import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../../constants";
import { Button, Flex, ListItem, Text, UnorderedList } from "@chakra-ui/react";

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { playerId } = usePlayer();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(ENDPOINTS.ROOMS);
        setRooms(response.data);
      } catch (err: any) {
        setError(
          "Error fetching rooms: " +
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
        "Error joining room: " + (err.response?.data?.message || err.message)
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
        "Error creating room: " + (err.response?.data?.message || err.message)
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
        Available Rooms
      </Text>
      {error && <Text colorScheme="red">{error}</Text>}
      <UnorderedList>
        {rooms.map((room, index) => (
          <ListItem key={room.id} style={{ margin: "10px 0" }}>
            <Button onClick={() => handleJoinRoom(room.id)} colorScheme="blue">
              Join Room {index + 1}
            </Button>
          </ListItem>
        ))}
      </UnorderedList>
      <Button colorScheme="green" onClick={handleCreateRoom}>
        Create Room
      </Button>
    </Flex>
  );
};

export default RoomsPage;
