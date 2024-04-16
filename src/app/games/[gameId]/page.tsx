"use client";

import { Heading, Text, Button, ButtonGroup, useToast } from '@chakra-ui/react'

import { useState, useEffect, } from "react";
import { useParams } from "next/navigation";
import AudioPlayer from "./AudioPlayer";

export default function Game() {
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
      console.log("Correct!");
      setResult("Correct!");
    } else {
      setResult("Incorrect!");
      console.log("Incorrect!");
    }
  }

  useEffect(() => {
    fetchGame(gameId);
  }, [gameId]);

  return (
    <div className="flex flex-col place-items-center space-y-5">
      <p>Random Song:</p>
      <div className="flex flex-row">
        {currentSongToGuess ? (
          <div>
            <div className="flex bg-red space-x-5">
              <h1>Listen to the Song</h1>
              <AudioPlayer src={currentSongToGuess.song.previewUrl} />
            </div>
            <div className="flex flex-col">
              <Text fontSize='3xl'>Song Info</Text>
              <Text fontSize="large">Title: {currentSongToGuess.song.title}</Text>
              <Text fontSize="large">Artists: {currentSongToGuess.song.artists.map((artist, index) => (
                <span key={index}>{artist.name}{artist}</span>
              ))}</Text>
            </div>
          </div>
        ) : (
          pageError ? <p>Error: {pageError}</p> : <p>Loading...</p>
        )}
      </div>
      <div className="flex flex-col">
        <Text fontSize="large"> Who do you think added this song? </Text>
        <div className="flex flex-row space-x-2">
          {
            currentSongToGuess && currentSongToGuess.potentialAdders.map((adder, index) => (
              <button className="hover:text-cyan-600" onClick={() => makeGuess(adder, currentAnswer)} key={index}>{adder}</button>
            ))
          }
        </div>
      </div>
      <div>
        <Text fontSize="large">Result: {result}</Text>
      </div>
      <div>
        <Button colorScheme='blue' onClick={() => fetchGame(gameId)}>Next Song</Button>
      </div>
    </div>
  );
}
