"use client";

import { useParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react";

interface Leaderboard {
  gameId: string;
  leaderboard: {
    userId: string;
    score: number;
  }[];
}

export default function Leaderboard() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);

  const fetchGameLeaderboard = useCallback(async (gameId: string) => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/${gameId}/leaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json()
        setLeaderboard(responseData);
      } else if (response.status == 404) {
        throw new Error("Game not found");
      } else {
        throw new Error("Failed to validate game id");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchGameLeaderboard(gameId);
  }, [gameId, fetchGameLeaderboard]);

  return (
    <div>
      {leaderboard &&
        leaderboard.leaderboard.map((entry, index) => (
          <div key={index}>
            <span>User: {entry.userId}</span>,
            <span> Score: {entry.score}</span>
          </div>
        ))}
    </div>
  )
}
