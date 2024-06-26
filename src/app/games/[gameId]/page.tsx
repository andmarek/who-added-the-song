"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Stack,
  Heading,
  Text,
  Button,
  ButtonGroup,
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

export default function Game() {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>();
  const searchParams = useSearchParams();

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
  const [result, setResult] = useState("");

  const fetchGame = useCallback(async (gameId: string) => {
    if (!gameId) return;
    setResult("");
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

  function makeGuess(adder: string, answer: string) {
    if (adder == answer) {
      addToast("Correct!", "success");
      setResult("Correct!");
    } else {
      addToast("Incorrect!", "error");
      setResult("Incorrect!");
    }
  }

  return (
    <div className="flex flex-col place-items-center space-y-5">
      <Text> <Link href="/"> Go Back </Link></Text>
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
              <Button className="hover:text-cyan-600" onClick={() => makeGuess(adder, currentAnswer)} key={index}>{adder}</Button>
            ))
          }
        </Stack>
      </div>
      <div>
        <Button colorScheme='blue' onClick={() => fetchGame(gameId)}>Next Song</Button>
      </div>
    </div>
  );
}
