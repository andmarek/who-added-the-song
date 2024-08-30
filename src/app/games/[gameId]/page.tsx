"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Game from "./game/Game";
import Leaderboard, { LeaderboardData } from "./leaderboard/Leadeboard";
import SaveScoreModal from "../../components/save-score-modal";
import { Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator } from "@chakra-ui/react";

export default function Page() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const [modalOpen, setModalOpen] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({
    leaderboard: [],
  });

  async function fetchLeaderboard(gameId: string) {
    try {
      const response = await fetch(`/api/games/${gameId}/leaderboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const responseData = await response.json();
        setLeaderboard(responseData);
      } else if (response.status == 404) {
        throw new Error("Game not found");
      } else {
        throw new Error("Failed to fetch leaderboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to fetch leaderboard:", error.message);
      }
    }
  }

  async function updateLeaderboardData(score: number, name: string) {
    try {
      const response = await fetch(`/api/games/${gameId}/leaderboard/${name}`, {
        method: "POST",
        body: JSON.stringify({ gameId, username: name, score }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const updatedLeaderboard = await response.json();
        setLeaderboard(updatedLeaderboard);
        setModalOpen(false);
      } else {
        throw new Error("Failed to update leaderboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to save score:", error.message);
      }
    }
  }

  function openModal() {
    setModalOpen(true);
  }

  return (
    <div>
      <SaveScoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sessionScore={sessionScore}
        updateLeaderboardData={updateLeaderboardData}
      />
      <Tabs position="relative" variant="unstyled">
        <TabList>
          <Tab>Game</Tab>
          <Tab>Leaderboard</Tab>
        </TabList>
        <TabIndicator
          mt="-1.5px"
          height="2px"
          bg="blue.500"
          borderRadius="1px"
        />
        <TabPanels>
          <TabPanel>
            <Game
              setSessionScore={setSessionScore}
              openModal={openModal}
            />
          </TabPanel>
          <TabPanel>
            <Leaderboard leaderboardData={leaderboard} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
