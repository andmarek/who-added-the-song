"use client";

import { useParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react";
import {
  Stack,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

export interface LeaderboardEntry {
  userId: string;
  score: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

interface LeaderboardProps {
  leaderboardData: LeaderboardData;
}
/*
GET  /{gameId}/leaderboard

Gives you the leaderboard for a game, people with scores

We sort it in the client

*/

export default function Leaderboard({ leaderboardData }: LeaderboardProps) {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>({ leaderboard: [{ "score": 5, "userId": "Andrew" }] });

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
    <TableContainer>
      <Table variant='simple'>
        <TableCaption>Leaderboard Rankings</TableCaption>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>User ID</Th>
            <Th isNumeric>Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {leaderboard && leaderboard.leaderboard.map((entry, index) => (
            <Tr key={entry.userId}>
              <Td>{index + 1}</Td>
              <Td>{entry.userId}</Td>
              <Td isNumeric>{entry.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
