import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
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
import { CARD_DESCRIPTION, ENDPOINTS, GAME_STATUS, IMAGE_PATH, OPPONENT_IMAGE_PATH, PAGES } from "../../constants";
import { useNavigate, useParams } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";

interface Card {
  id: number;
  power: number;
  name: string;
  image?: string;
  isCloned?: boolean;
}

const GameRoomPage: React.FC = () => {
  const battlefieldHeight = 300; // Height of the battlefield area
  const battlefieldWidth = 900; // Width of the battlefield area
  const cardHeight = 165; // Desired height for the card
  const cardWidth = cardHeight * 0.7; // Width based on typical card aspect ratio (e.g., 70% of height)
  const overlapAmount = 30;

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
        setPlayerCards(player.cards.map((card: Card) => ({ ...card, image: IMAGE_PATH(player.color)[card.id] })));
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
        setOpponentCurrentCard({ ...opponent.previousMove, image: IMAGE_PATH(opponentColor)[opponent.previousMove.id] });
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
      const { opponentMove } = response.data;
      setOpponentCurrentCard({ ...opponentMove, image: IMAGE_PATH(opponentColor)[opponentMove.id] });
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
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" justifyContent="center" mb={4} position="relative">
          {opponentCards.map((card, index) => (
            <Box
              key={card}
              width={`${cardWidth}px`}
              height={`${cardHeight}px`}
              transition="transform 0.2s, z-index 0.2s"
              _hover={{
                zIndex: 3, // Bring hovered card to the front
                transform: `scale(1.1)`, // Slight zoom on hover
              }}
              zIndex={index} // Stacking order
              ml={index !== 0 ? `-${overlapAmount}px` : '0'} // Overlap cards by setting negative margin-left
            >
              <Image
                src={OPPONENT_IMAGE_PATH}
                fallback={(<Box />)}
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
          flexDirection="column"
          justifyContent="space-between"
          position="relative"
        >

          {/* Top Information */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" width="100%" mb={2}>
            {opponentPreviousCard ? (
              <Text
                textAlign="left"
                color="gray.300"
                fontSize="lg"
                width="33%" // Reserve space
              >
                Carta anterior: {opponentPreviousCard?.isCloned
                  ? `Imitador (${opponentPreviousCard?.name})`
                  : opponentPreviousCard?.name}
              </Text>
            ) : (
              <Box width="33%" /> // Placeholder to keep alignment
            )}

            {/* Center Round Text */}
            <Box flex="1" textAlign="center">
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="white.300"
              >
                Round {currentRound}
              </Text>
            </Box>

            <Box width="33%" />
          </Box>

          {/* Current Cards Section with VS in Between */}
          <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
            {playerCurrentCard && (
              <Box
                bg={`${playerColor}.600`}
                borderRadius="md"
                color="white"
                width="120px"
                height="165px"
                textAlign="center"
                zIndex={2}
                mx={2} // Margin for spacing
              >
                <Image
                  src={playerCurrentCard.image}
                  alt={playerCurrentCard.name}
                  fallback={(<Box />)}
                  minWidth={`${cardWidth}px`}
                  objectFit="cover"
                  boxSize="100%"
                  borderRadius="md"
                />
              </Box>
            )}

            {opponentCurrentCard && (
              <>
                <Text fontSize="24px" fontWeight="bold" color="white" mx={4}>VS</Text>
                <Box
                  bg={`${opponentColor}.600`}
                  borderRadius="md"
                  color="white"
                  width="120px"
                  height="165px"
                  textAlign="center"
                  zIndex={2}
                  mx={2} // Margin for spacing
                >
                  <Image
                    src={opponentCurrentCard.image}
                    alt={opponentCurrentCard.name}
                    fallback={(<Box />)}
                    minWidth={`${cardWidth}px`}
                    objectFit="cover"
                    boxSize="100%"
                    borderRadius="md"
                  />
                </Box>
              </>
            )}
          </Box>

          {/* Bottom Section with Previous Card, Suspended Rounds in Center */}
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
            <Box flex="1" />
            {/* Suspended Rounds in Center */}
            <Box flex="1" textAlign="center">
              {suspendedRounds > 0 && (
                <Text fontSize="lg" color="gray.300" fontWeight="bold">
                  Rodadas empatadas: {suspendedRounds}
                </Text>
              )}
            </Box>

            {/* Player's Previous Card Aligned to Right */}
            <Box flex="1" textAlign="right">
              {playerPreviousCard && (
                <Text
                  textAlign="right"
                  color="gray.300"
                  fontSize="lg"
                >
                  Carta anterior: {playerPreviousCard?.isCloned
                    ? `Imitador (${playerPreviousCard?.name})`
                    : playerPreviousCard?.name}
                </Text>
              )}
            </Box>
          </Box>
        </Box>

        <HStack>
          <Text fontWeight="bold" fontSize="24px">{nickname}</Text>
          <Text fontSize="24px">Score: {playerScore}</Text>
        </HStack>

        <Box display="flex" justifyContent="center" mt={4} position="relative">
          {playerCards.map((card, index) => {
            const isSelected = selectedCardIndex === index;
            const isHovered = selectedCardIndex === null;

            return (
              <Box
                key={card.id}
                onClick={() => handleCardClick(index)}
                width={`${cardWidth}px`}
                height={`${cardHeight}px`}
                zIndex={isHovered ? 2 : isSelected ? 3 : 1} // Manage zIndex for hover and selection
                transition="transform 0.2s, z-index 0.2s"
                _hover={{
                  zIndex: 3, // Bring hovered card to the front
                  transform: `scale(1.1)`, // Slight zoom on hover
                }}
                ml={index !== 0 ? `-${overlapAmount}px` : '0'} // Overlap cards by setting negative margin-left
              >
                <Image
                  src={card.image}
                  alt={card.name}
                  fallback={(<Box />)}
                  minWidth={`${cardWidth}px`}
                  objectFit="cover"
                  boxSize="100%"
                  borderRadius="md"
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      <Modal isOpen={gameWinner.length > 0} onClose={handleCloseEndGameModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" display="flex" flexDirection="column" alignItems="center">
          <ModalHeader fontSize="2xl">{gameWinner} ganhou o jogo!</ModalHeader>
          <ModalFooter>
            <Button colorScheme="gray" onClick={handleCloseEndGameModal} ml={3}>Sair</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={Boolean(selectedCard)} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader fontSize="2xl">Força: {selectedCard?.power}</ModalHeader>
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <Text fontSize="4xl" mb={4}>{selectedCard?.name}</Text>
            <Text fontSize="20px">{selectedCard?.id && CARD_DESCRIPTION[selectedCard.id]
              ? CARD_DESCRIPTION[selectedCard.id]
              : "Description not available."}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={() => playCard(selectedCard!)}>Confirmar</Button>
            <Button colorScheme="gray" onClick={handleCloseModal} ml={3}>Voltar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Box>
  );
};

export default GameRoomPage;
