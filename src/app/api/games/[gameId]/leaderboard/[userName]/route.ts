import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

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
    Key: { gameId },
    UpdateExpression: `
      SET leaderboard = list_append(
        COALESCE(
          REMOVE_IF(
            COALESCE(leaderboard, :empty_list),
            :username_to_remove
          ),
          :empty_list
        ),
        :new_entry
      )
    `,
    ExpressionAttributeValues: {
      ":username_to_remove": { username },
      ":empty_list": [],
      ":new_entry": [{ username, score }],
    },
  });

  await docClient.send(updateCommand);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { gameId, username, score } = body;

  if (!gameId || !username || typeof score !== 'number') {
    return Response.json({ error: "gameId, username, and score are required" }, { status: 400 });
  }

  try {
    await updateLeaderboard(gameId, username, score);

    // Fetch the updated leaderboard
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { gameId },
      ProjectionExpression: "leaderboard",
    });

    const result = await docClient.send(getCommand);
    const leaderboard = result.Item?.leaderboard || [];

    return Response.json({ leaderboard });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return Response.json({ error: "Failed to update leaderboard" }, { status: 500 });
  }
}
