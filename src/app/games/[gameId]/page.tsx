"use client";

import { Card, CardHeader, CardBody, Image, Stack, Heading, Text, Button, ButtonGroup, useToast } from '@chakra-ui/react'

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import AudioPlayer from "./AudioPlayer";

export default function Game() {
  const toast = useToast();
  const toastIdRef = useRef();

  function addToast(text: string, status: "success" | "error") {
    toastIdRef.current = toast({ title: text, status: status, isClosable: true, position: "top", duration: 1000 })
  }

  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const [pageError, setPageError] = useState("");

  const [currentSongToGuess, setCurrentSongToGuess] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [result, setResult] = useState("");

  async function fetchGame(gameId: string) {
    if (!gameId) return;
    setResult("");
    try {

      const response = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        body: JSON.stringify({ gameId }),
        headers: {
          "Content-Type": "application/json",
        }
      })
      if (response.ok) {
        const repsonseData = await response.json();
        console.log(repsonseData);
        setCurrentSongToGuess(repsonseData);
        setCurrentAnswer(repsonseData.personWhoAdded);
      } else if (response.status == 404) {
        throw new Error("Game not found");
      } else {
        throw new Error("Failed to validate game id");
      }
    } catch (error) {
      console.error("Failed to create or find game. Double check your URL!");
      setPageError(error.message);
    }
  }

  function makeGuess(adder, answer) {
    if (adder == answer) {
      addToast("Correct!", "success");
      console.log("Correct!");
      setResult("Correct!");
    } else {
      addToast("Incorrect!", "error");
      setResult("Incorrect!");
      console.log("Incorrect!");
    }
  }

  useEffect(() => {
    fetchGame(gameId);
  }, [gameId]);

  return (
    <div className="flex flex-col place-items-center space-y-5">
      <Heading>Guess Who Added the Song:</Heading>
      <div className="flex flex-row">
        {currentSongToGuess ? (
          <div>
            <div className="flex bg-red space-x-5">
              <h1>Listen to the Song</h1>
              <AudioPlayer src={currentSongToGuess.song.previewUrl} />
            </div>
            <Card
              direction={{ base: "column", sm: "row" }}
              variant="outline"
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
                <Text fontSize="large">Artists: {currentSongToGuess.song.artists.map((artist, index) => (
                  <span key={index}>{artist.name}{artist}</span>
                ))}</Text>
              </CardBody>
            </Card>
          </div>
        ) : (
          pageError ? <p>Error: {pageError}</p> : <p>Loading...</p>
        )}
      </div>
      <div className="flex flex-col place-items-center">
        <Text fontSize="large"> Who do you think added this song? </Text>
        <Stack>
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
