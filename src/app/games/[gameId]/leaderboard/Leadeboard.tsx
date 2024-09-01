"use client";

import { useParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react";

export interface LeaderboardEntry {
  username: string;
  score: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

interface LeaderboardProps {
  leaderboardData: LeaderboardData;
}

export default function Leaderboard({ leaderboardData }: LeaderboardProps) {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(leaderboardData);

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

  // Sort the leaderboard entries
  const sortedLeaderboard = leaderboard?.leaderboard.sort((a, b) => b.score - a.score) || [];

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold">Leaderboard Rankings</h2>
      </div>
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedLeaderboard.map((entry, index) => (
            <tr key={entry.username} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="py-4 px-6 whitespace-nowrap">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${index < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-700'} font-bold text-sm`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{entry.username}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 text-right">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
