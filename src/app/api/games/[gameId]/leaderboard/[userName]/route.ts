import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddb);
const tableName = process.env.TABLE_NAME as string;

interface LeaderboardEntry {
  username: string;
  score: number;
}

async function updateLeaderboard(gameId: string, username: string, score: number): Promise<void> {
  const updateCommand = new UpdateCommand({
    TableName: tableName,
    Key: { playlistId: gameId },
    UpdateExpression: `
      SET leaderboard = list_append(
        if_not_exists(leaderboard, :empty_list),
        :new_entry
      )
    `,
    ExpressionAttributeValues: {
      ":empty_list": [],
      ":new_entry": [{
        username: username,
        score: score
      }],
    },
  });

  await docClient.send(updateCommand);
}

async function getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: { playlistId: gameId },
    ProjectionExpression: "leaderboard",
  });

  const result = await docClient.send(getCommand);
  const leaderboard = result.Item?.leaderboard;
  
  if (Array.isArray(leaderboard)) {
    return leaderboard.map((entry: any) => ({
      username: entry.username,
      score: entry.score
    }));
  } else {
    return [];
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string; userName: string } }
) {
  const { gameId, userName } = params;
  const { score } = await request.json();

  if (!gameId || !userName || typeof score !== 'number') {
    return NextResponse.json({ error: "gameId, userName, and score are required" }, { status: 400 });
  }

  try {
    await updateLeaderboard(gameId, userName, score);
    const updatedLeaderboard = await getLeaderboard(gameId);
    return NextResponse.json({ leaderboard: updatedLeaderboard });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return NextResponse.json({ error: "Failed to update leaderboard" }, { status: 500 });
  }
}
