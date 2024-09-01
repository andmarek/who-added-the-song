import {
  Card,
  CardBody,
  Image,
  Stack,
  Heading,
  Text,
  Button,
  Spinner,
  useToast,
  ToastId
} from '@chakra-ui/react'

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, } from "next/navigation";
import Link from 'next/link'

interface Artist {
  name: string;
}

interface Song {
  albumImageUrl: string;
  title: string;
  artists: string[];
  previewUrl: string;
}

interface CurrentSongToGuess {
  song: Song;
  personWhoAdded: string; // Used in setting `currentAnswer`
  potentialAdders: string[]; // Array of strings, as implied by the mapping
}

interface GameProps {
  openModal: () => void;
  setSessionScore: (score: number) => void;
}

export default function Game({ openModal, setSessionScore }: GameProps) {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>();
  const searchParams = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Add this new state
  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  let options = searchParams.get('options');

  if (options == null) {
    options = "4";
  }

  function addToast(text: string, status: "success" | "error") {
    toastIdRef.current = toast({ title: text, status: status, isClosable: true, position: "top", duration: 1000 })
  }

  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const [pageError, setPageError] = useState("");

  const [currentSongToGuess, setCurrentSongToGuess] = useState<CurrentSongToGuess | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");

  // TODO: is result needed?
  const [result, setResult] = useState("");

  const fetchGame = useCallback(async (gameId: string) => {
    // TODO: better error handling here without the gameId
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        body: JSON.stringify({ gameId: gameId, options: options }),
        headers: {
          "Content-Type": "application/json",
        }
      })
      if (response.ok) {
        const repsonseData = await response.json();
        setCurrentSongToGuess(repsonseData);
        setCurrentAnswer(repsonseData.personWhoAdded);
      } else if (response.status == 404) {
        throw new Error("Game not found");
      } else {
        throw new Error("Failed to validate game id");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to create or find game. Double check your URL!");
        setPageError(error.message);
      }
    }
  }, [options]);

  useEffect(() => {
    fetchGame(gameId);
  }, [gameId, fetchGame]);

  useEffect(() => {
    if (shouldOpenModal) {
      setSessionScore(score + 1);
      openModal();
      setShouldOpenModal(false);
    }
  }, [shouldOpenModal, score, setSessionScore, openModal]);

  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [guessedAdders, setGuessedAdders] = useState<string[]>([]);

  function makeGuess(adder: string, answer: string) {
    if (guessedCorrectly) return; // Prevent multiple correct guesses

    setGuessedAdders([...guessedAdders, adder]);

    if (adder === answer) {
      addToast("Correct!", "success");
      setResult("Correct!");
      setScore(score + 1);
      setGuessedCorrectly(true);
    } else {
      addToast("Incorrect!", "error");
      setResult("Incorrect!");
      setAttemptsLeft((prevAttempts) => {
        const newAttempts = prevAttempts - 1;
        if (newAttempts === 0) {
          setShouldOpenModal(true);
          setGuessedCorrectly(true); // Lock all buttons when attempts are exhausted
        }
        return newAttempts;
      });
    }
  }

  function nextSong() {
    fetchGame(gameId);
    setGuessedCorrectly(false);
    setGuessedAdders([]);
  }

  return (
    <div className="flex flex-col place-items-center space-y-5">
      <Text> <Link href="/"> Go Back </Link></Text>
      <Text> Attempts {attemptsLeft} </Text>
      <Text> Score {score} </Text>
      <div className="flex flex-row">
        {currentSongToGuess ? (
          <div className="flex flex-col items-center space-y-2">
            <Heading className="w-full">Guess Who Added the Song</Heading>
            <Card
              direction={{ base: "column", sm: "row" }}
              variant="outline"
              className="w-full"
            >
              <Image
                objectFit='cover'
                maxW={{ base: '100%', sm: '200px' }}
                src={currentSongToGuess.song.albumImageUrl}
                borderRadius="md"
                alt='Album Cover Art Image'
              />
              <CardBody>
                <Text fontSize="large">Title: {currentSongToGuess.song.title}</Text>
                <Text fontSize="large">Artists: {currentSongToGuess.song.artists.map((artist) => artist).join(', ')}</Text>
              </CardBody>
            </Card>
            <audio className="self-center w-full" controls src={currentSongToGuess.song.previewUrl} />
          </div>
        ) : (
          pageError ? <p>Error: {pageError}</p> : <Spinner />
        )}
      </div>
      <div className="flex flex-col place-items-center">
        <Stack direction={{ base: 'column', md: 'row' }}>
          {
            currentSongToGuess && currentSongToGuess.potentialAdders.map((adder, index) => (
              <Button
                key={index}
                onClick={() => makeGuess(adder, currentAnswer)}
                disabled={guessedCorrectly || guessedAdders.includes(adder)}
                className={`
                  ${guessedAdders.includes(adder) ? 
                    (adder === currentAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 
                    'hover:text-cyan-600'
                  }
                  ${guessedCorrectly && adder !== currentAnswer ? 'opacity-50' : ''}
                `}
              >
                {adder}
              </Button>
            ))
          }
        </Stack>
      </div>
      <div>
        <Button 
          colorScheme='blue' 
          onClick={nextSong}
          disabled={!guessedCorrectly && attemptsLeft > 0}
        >
          Next Song
        </Button>
      </div>
    </div>
  );
}
