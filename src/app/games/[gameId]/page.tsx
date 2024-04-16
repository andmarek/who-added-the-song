"use client";

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
              <h1> Song Info </h1>
              <p>Title: {currentSongToGuess.song.title}</p>
              <p>Artists: {currentSongToGuess.song.artists.map((artist, index) => (
                <span key={index}>{artist.name}{artist}</span>
              ))}</p>
            </div>
          </div>
        ) : (
          pageError ? <p>Error: {pageError}</p> : <p>Loading...</p>
        )}
      </div>
      <div className="flex flex-col">
        <p> Who do you think added this song? </p>
        <div className="flex flex-row space-x-2">
          {
            currentSongToGuess && currentSongToGuess.potentialAdders.map((adder, index) => (
              <button className="hover:text-cyan-600" onClick={() => makeGuess(adder, currentAnswer)} key={index}>{adder}</button>
            ))
          }
        </div>
      </div>
      <div>
        <p>Result: {result}</p>
      </div>
      <div>
        <button className="hover:text-cyan-600" onClick={() => fetchGame(gameId)}>Next Song</button>
      </div>
    </div>
  );
}
