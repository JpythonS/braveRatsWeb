import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { ENDPOINTS } from '../../constants';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';

const GameRoomPage: React.FC = () => {
  const battlefieldHeight = 300; // Height of the battlefield area
  const battlefieldWidth = 800; // Width of the battlefield area
  const cardHeight = 165; // Desired height for the card
  const cardWidth = cardHeight * 0.7; // Width based on typical card aspect ratio (e.g., 70% of height)

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { playerId, nickname } = usePlayer();
  const { roomId } = useParams<{ roomId: string }>();

  const [playerCards, setPlayerCards] = useState<Array<{ id: number; power: number; name: string; }>>([]);
  const [playerColor, setPlayerColor] = useState<string>("");
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerCurrentCard, setPlayerCurrentCard] = useState<{ id: number; power: number; name: string; } | null>(null);

  const [opponentName, setOpponentName] = useState<string>("");
  const [opponentCurrentCard, setOpponentCurrentCard] = useState<{ id: number; power: number; name: string; } | null>(null);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [opponentColor, setOpponentColor] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ id: number; power: number; name: string; } | null>(null);

  useEffect(() => {
    if (!roomId || !playerId) {
      setError('Room or Player is not defined.');
      return;
    }

    const fetchInitialState = async () => {
      try {
        const response = await axios.get(ENDPOINTS.GAME_STATE(roomId, playerId));
        const { player, opponent, round } = response.data;
        setPlayerColor(player.color);
        setPlayerCards(player.cards);
        setPlayerScore(player.score);
        setCurrentRound(round);
        setOpponentName(opponent.name);
        setOpponentColor(opponent.color);

      } catch (err: any) {
        setError(
          'Error fetching rooms: ' +
          (err.response?.data?.message || err.message)
        );
      }
    };

    fetchInitialState();
  }, []);

  useEffect(() => {
    let intervalId: number;
    // Poll every 5 seconds
    if (playerCurrentCard) {
      intervalId = setInterval(() => {
        checkRoomStatus();
      }, 5000);
    }

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [playerCurrentCard]);

  const checkRoomStatus = async () => {
    if (!roomId || !playerId) {
      setError('Room or Player is not defined.');
      return;
    }

    try {
      const response = await axios.get(ENDPOINTS.GAME_STATE(roomId, playerId));
      const { gameStatus, player, opponent } = response.data;
      if (gameStatus === "round-result") {
        setOpponentCurrentCard(opponent.previousMove);

        setTimeout(() => {
          setOpponentCurrentCard(null);
          setPlayerCurrentCard(null);
        }, 5000);

        setPlayerScore(player.score);
        setOpponentScore(opponent.score);
      }
    } catch (err: any) {
      setError(
        'Error checking room status: ' +
        (err.response?.data?.message || err.message)
      );
    }
  };

  const playCard = async (card: { id: number; power: number; name: string; }) => {
    setPlayerCurrentCard(card);
    setPlayerCards(prev => prev.filter(c => c.id !== card.id));
    handleCloseModal(); // Close the modal after playing a card 

    try {
      await axios.post(ENDPOINTS.PLAY_ROUND, { roomId, playerId, selectedCardId: card.id });
    } catch (err: any) {
      setError(
        'Error playing round: ' +
        (err.response?.data?.message || err.message)
      );
    }
  };

  const handleCardClick = (index: number) => {
    setSelectedCardIndex(index);
    setSelectedCard(playerCards[index]);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedCardIndex(null);
    setSelectedCard(null);
    onClose(); // Close the modal
  };

  return (
    <Box p={5} bg="gray.900" color="white" minHeight="100vh">
      <Heading mb={4}>Game Room</Heading>

      <Flex justify="space-between" mb={4}>
        <VStack align="start">
          <Text>{nickname}</Text>
          <Text>Score: {playerScore}</Text>
        </VStack>
        <VStack align="start">
          <Text>{opponentName}</Text>
          <Text>Score: {opponentScore}</Text>
        </VStack>
      </Flex>

      {/* Last round cards */}
      {/* <Box bg="gray.800" borderRadius="md" p={4} mb={4}>
        <Text fontSize="xl" mb={2}>Current Played Cards</Text>
        <HStack spacing={5}>
          <Text>Player 1 Played: {playerCurrentCard?.name || "None"}</Text>
          <Text>Player 2 Played: {opponentCurrentCard?.name || "None"}</Text>
        </HStack>
      </Box>
      <Divider mb={4} /> */}


      {/* Opponent's cards layout */}
      <Box display="flex" justifyContent="center" mb={4} position="relative">
        {Array.from({ length: 9 - (currentRound - 1) }, (_, index) => index).map((card, index) => (
          <Box
            key={card}
            bg={`${opponentColor}.600`}
            borderRadius="md"
            color="white"
            width={`${cardWidth}px`}
            height={`${cardHeight}px`}
            textAlign="center"
            p={4}
            m={1}
            position="relative"
            zIndex={1}
          >
            "Carta" {/* Display opponent's card name */}
          </Box>
        ))}
      </Box>


      <Flex direction="column" alignItems="center">
        <Box
          bg="gray.700"
          borderRadius="md"
          p={5}
          width="100%"
          maxWidth={battlefieldWidth}
          height={battlefieldHeight}
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
          position="relative"
        >
          {playerCurrentCard && (
            <Box
              position="absolute"
              left="10%"
              bottom="20%"
              bg={`${playerColor}.600`}
              borderRadius="md"
              p={4}
              color="white"
              width="120px"
              height="165px"
              textAlign="center"
              zIndex={2}
              transform="translateY(-30px)"
            >
              {playerCurrentCard.name}
            </Box>
          )}
          {opponentCurrentCard && (
            <Box
              position="absolute"
              right="10%"
              bottom="20%"
              bg={`${playerColor}.600`}
              borderRadius="md"
              p={4}
              color="white"
              width="120px"
              height="165px"
              textAlign="center"
              zIndex={2}
              transform="translateY(-30px)"
            >
              {opponentCurrentCard.name}
            </Box>
          )}
          <Text textAlign="center" color="gray.300" fontSize="lg">Round {currentRound}</Text>
        </Box>

        <Box display="flex" justifyContent="center" mb={4} position="relative">
          {playerCards.map((card, index) => {
            const isSelected = selectedCardIndex === index;
            const isHovered = selectedCardIndex === null;

            return (
              <Button
                key={card.id}
                onClick={() => handleCardClick(index)}
                colorScheme={playerColor}
                variant="solid"
                width={`${cardWidth}px`} // Set width based on height
                height={`${cardHeight}px`} // Set height for cards
                position="relative"
                p={4}
                m={1}
                zIndex={isHovered ? 2 : (isSelected ? 3 : 1)} // Manage zIndex for hover and selection
                transition="transform 0.2s"
                _hover={{
                  zIndex: 3, // Bring hovered card to the front
                  transform: `scale(1.8) translateY(-5px)`, // Slight lift and zoom on hover
                }}
              >
                {card.name}
              </Button>
            );
          })}
        </Box>
      </Flex>

      {/* Modal for displaying the selected card */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader fontSize="2xl">Selected Card</ModalHeader>
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <Text fontSize="4xl" mb={4}>{selectedCard?.name}</Text>
            <Text>Card Details and Power go here.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={() => playCard(selectedCard!)}>
              Confirm Card
            </Button>
            <Button colorScheme="gray" onClick={handleCloseModal} ml={3}>
              Back
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GameRoomPage;