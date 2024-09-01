"use client";

import { useParams } from "next/navigation"
import { useState, useCallback, useEffect, useRef } from "react";

export interface LeaderboardEntry {
  username: string;
  score: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

interface LeaderboardProps {
  leaderboardData: LeaderboardData;
  latestEntry?: LeaderboardEntry;
}

export default function Leaderboard({ leaderboardData, latestEntry }: LeaderboardProps) {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const [leaderboard, setLeaderboard] = useState<LeaderboardData>(leaderboardData);
  const latestEntryRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    setLeaderboard(leaderboardData);
  }, [leaderboardData]);

  useEffect(() => {
    if (latestEntry && latestEntryRef.current) {
      latestEntryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [latestEntry]);

  // Sort the leaderboard entries
  const sortedLeaderboard = leaderboard.leaderboard.sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold">Leaderboard Rankings</h2>
      </div>
      <div className="overflow-auto max-h-96">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedLeaderboard.map((entry, index) => (
              <tr 
                key={`${entry.username}-${entry.score}-${index}`}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${latestEntry && entry.username === latestEntry.username && entry.score === latestEntry.score ? 'bg-yellow-100' : ''}`}
                ref={latestEntry && entry.username === latestEntry.username && entry.score === latestEntry.score ? latestEntryRef : null}
              >
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
    </div>
  )
}
