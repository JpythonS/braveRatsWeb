import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  HStack,
  Image,
} from "@chakra-ui/react";
import axios from "axios";
import { CARD_DESCRIPTION, ENDPOINTS, GAME_STATUS, IMAGE_PATH, PAGES } from "../../constants";
import { useNavigate, useParams } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";

interface Card {
  id: number;
  power: number;
  name: string;
  isCloned?: boolean;
}

const GameRoomPage: React.FC = () => {
  const battlefieldHeight = 300; // Height of the battlefield area
  const battlefieldWidth = 900; // Width of the battlefield area
  const cardHeight = 165; // Desired height for the card
  const cardWidth = cardHeight * 0.7; // Width based on typical card aspect ratio (e.g., 70% of height)

  const { onOpen, onClose } = useDisclosure();
  const { playerId, nickname } = usePlayer();
  const { roomId } = useParams<{ roomId: string }>();

  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [playerColor, setPlayerColor] = useState<string>("");
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [playerCurrentCard, setPlayerCurrentCard] = useState<Card | null>(null);
  const [playerPreviousCard, setPlayerPreviousCard] = useState<Card | null>(null);

  const [opponentName, setOpponentName] = useState<string>("");
  const [opponentCurrentCard, setOpponentCurrentCard] = useState<Card | null>(null);
  const [opponentPreviousCard, setOpponentPreviousCard] = useState<Card | null>(null);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [opponentColor, setOpponentColor] = useState<string>("");
  const [opponentCards, setOpponentCards] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [espiaoPowerUp, setEspiaoPowerUp] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [suspendedRounds, setSuspendedRounds] = useState(0);

  const [gameWinner, setGameWinner] = useState<string>("");
  const navigate = useNavigate();

  let timeoutId: number;

  useEffect(() => {
    if (!roomId || !playerId) {
      setError("Room or Player is not defined.");
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
        setOpponentCards(Array.from({ length: 9 - (round - 1) }, (_, index) => index));
      } catch (err: any) {
        setError(
          "Error fetching rooms: " +
          (err.response?.data?.message || err.message)
        );
      }
    };

    fetchInitialState();
  }, []);

  useEffect(() => {
    let intervalId: number;
    if (playerCurrentCard) {
      intervalId = setInterval(() => {
        checkRoomStatus();
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [playerCurrentCard]);

  useEffect(() => {
    let intervalId: number;
    if (espiaoPowerUp) {
      intervalId = setInterval(() => {
        viewOpponentCard();
      }, 3000);
    }
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [espiaoPowerUp]);

  const checkRoomStatus = async () => {
    if (!roomId || !playerId) {
      setError("Room or Player is not defined.");
      return;
    }

    try {
      const response = await axios.get(ENDPOINTS.GAME_STATE(roomId, playerId));
      const { gameStatus, player, opponent, round, winner, suspendedRounds } = response.data;
      if (gameStatus === GAME_STATUS.ROUND_RESULT || gameStatus === GAME_STATUS.END_GAME) {
        setOpponentCurrentCard(opponent.previousMove);
        setOpponentPreviousCard(opponent.previousMove);
        setOpponentCards(Array.from({ length: 9 - (round - 1) }, (_, index) => index));

        setPlayerPreviousCard(player.previousMove);
        setCurrentRound(round);

        if (player.previousMove?.name === "Espião" && !player.previousMove?.canceledCardPower) {
          setEspiaoPowerUp(true);
        }

        timeoutId = setTimeout(() => {
          setOpponentCurrentCard(null);
          setPlayerCurrentCard(null);
          setPlayerScore(player.score);
          setOpponentScore(opponent.score);
          setSuspendedRounds(suspendedRounds);

          if (gameStatus === GAME_STATUS.END_GAME) {
            setGameWinner(winner);
          }
        }, 3000);
      }

    } catch (err: any) {
      setError(
        "Error checking room status: " +
        (err.response?.data?.message || err.message)
      );
    }
  };

  const viewOpponentCard = async () => {
    if (!roomId || !playerId) {
      setError("Room or Player is not defined.");
      return;
    }

    try {
      const response = await axios.post(ENDPOINTS.VIEW_OPPONENT_MOVE, {
        roomId,
        playerId,
      });
      setOpponentCurrentCard(response.data.opponentMove);
      setEspiaoPowerUp(false);
    } catch (err: any) {
      setError(
        "Error viewing opponent move: " +
        (err.response?.data?.message || err.message)
      );
    }
  };

  const playCard = async (card: {
    id: number;
    power: number;
    name: string;
  }) => {
    setPlayerCurrentCard(card);
    handleCloseModal();

    try {
      await axios.post(ENDPOINTS.PLAY_ROUND, {
        roomId,
        playerId,
        selectedCardId: card.id,
      });

      setPlayerCards((prev) => prev.filter((c) => c.id !== card.id));
    } catch (err: any) {
      setError(
        "Error playing round: " + (err.response?.data?.message || err.message)
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
    onClose();
  };

  const handleCloseEndGameModal = () => {
    onClose();
    navigate(PAGES.ROOMS);
  }

  return (
    <Box p={5} bg="gray.900" color="white" minHeight="100vh">
      <Flex direction="column" alignItems="center">
        <Box display="flex" justifyContent="center" mb={4} position="relative">
          {opponentCards.map((card) => (
            <Box
              key={card}
              bg={`${opponentColor}.600`}
              borderRadius="md"
              color="white"
              width={`${cardWidth}px`}
              height={`${cardHeight}px`}
              textAlign="center"
              m={1}
              position="relative"
              zIndex={1}
            >
              <Image src={"/dist/brave-rats.png"}
                alt={"verso"}
                minWidth={`${cardWidth}px`}
                objectFit="cover"
                boxSize="100%"
                borderRadius="md" />
            </Box>
          ))}
        </Box>
        <HStack justify="center">
          <Text fontWeight="bold" fontSize="24px">
            {opponentName}
          </Text>
          <Text fontSize="24px">Score: {opponentScore}</Text>
        </HStack>

        <Box
          bg="gray.700"
          borderRadius="md"
          p={5}
          width="100%"
          maxWidth={battlefieldWidth}
          height={battlefieldHeight}
          mb={4}
          mt={4}
          display="flex"
          justifyContent="space-between"
          position="relative"
        >
          {opponentPreviousCard && (
            <Text
              alignSelf="start"
              justifyContent="start"
              textAlign="center"
              color="gray.300"
              fontSize="lg"
            >
              Carta anterior: {opponentPreviousCard?.isCloned
                ? `Imitador (${opponentPreviousCard?.name})`
                : opponentPreviousCard?.name}
            </Text>
          )}

          {suspendedRounds > 0 && (
            <Text
              alignSelf="end"
              justifyContent="start"
              textAlign="center"
              color="gray.300"
              fontSize="lg"
            >
              Rodadas empatadas: {suspendedRounds}
            </Text>
          )}

          {playerCurrentCard && (
            <Box
              position="absolute"
              left="25%"
              bottom="10%"
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
            <>
              <Text fontSize="24px" fontWeight="bold" alignSelf="center" justifyContent="center">VS</Text>

              <Box
                position="absolute"
                right="25%"
                bottom="10%"
                bg={`${opponentColor}.600`}
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
            </>
          )}

          <Text
            position="absolute"
            left="40%"
            right="40%"
            top="5%"
            textAlign="center"
            color="white.300"
            fontSize="lg"
            fontWeight="bold"
          >
            Round {currentRound}
          </Text>

          {playerPreviousCard && (
            <Text
              justifySelf="end"
              alignSelf="end"
              textAlign="center"
              color="gray.300"
              fontSize="lg"
            >
              Carta anterior: {playerPreviousCard?.isCloned
                ? `Imitador (${playerPreviousCard?.name})`
                : playerPreviousCard?.name}
            </Text>
          )}
        </Box>

        <HStack>
          <Text fontWeight="bold" fontSize="24px">
            {nickname}
          </Text>
          <Text fontSize="24px">Score: {playerScore}</Text>
        </HStack>
        <Box display="flex" justifyContent="center" mb={4} mt={4}>
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
                m={1}
                zIndex={isHovered ? 2 : isSelected ? 3 : 1} // Manage zIndex for hover and selection
                transition="transform 0.2s"
                _hover={{
                  zIndex: 3, // Bring hovered card to the front
                  transform: `scale(1.6) translateY(-5px)`, // Slight lift and zoom on hover
                }}
              >
                <Image src={IMAGE_PATH(playerColor)[card.id]}
                  alt={card.name}
                  minWidth={`${cardWidth}px`}
                  objectFit="cover"
                  boxSize="100%"
                  borderRadius="md" />
              </Button>
            );
          })}
        </Box>
      </Flex>

      <Modal isOpen={gameWinner.length > 0} onClose={handleCloseEndGameModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" display="flex" flexDirection="column" alignItems="center">
          <ModalHeader fontSize="2xl">{gameWinner} ganhou o jogo!</ModalHeader>
          <ModalFooter>
            <Button colorScheme="gray" onClick={handleCloseEndGameModal} ml={3}>
              Sair
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={Boolean(selectedCard)} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader fontSize="2xl">Força: {selectedCard?.power}</ModalHeader>
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <Text fontSize="4xl" mb={4}>
              {selectedCard?.name}
            </Text>
            <Text fontSize="20px">{selectedCard?.id && CARD_DESCRIPTION[selectedCard.id]
              ? CARD_DESCRIPTION[selectedCard.id]
              : "Description not available."}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={() => playCard(selectedCard!)}>
              Confirmar
            </Button>
            <Button colorScheme="gray" onClick={handleCloseModal} ml={3}>
              Voltar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Box>
  );
};

export default GameRoomPage;
