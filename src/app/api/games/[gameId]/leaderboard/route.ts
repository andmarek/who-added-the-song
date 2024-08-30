import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddb);
const tableName = process.env.TABLE_NAME as string;

async function getLeaderboard(dynamoTableName: string, gameId: string) {
  const response = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: {
      playlistId: gameId
    }
  }));
  if (response.Item) {
    return response.Item.leaderboard;
  }
  return [];
}

export async function POST(request: NextRequest, { params }: { params: { gameId: string } }) {
  const gameId = params.gameId;
  const leaderboard = await getLeaderboard(tableName, gameId);
  return NextResponse.json({ leaderboard });
}
