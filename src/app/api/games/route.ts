import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import axios from "axios";

const ddb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddb);
const tableName = process.env.BOARDS_DYNAMODB_TABLE as string;

const fetchPlaylist = async (playlistId: string) => {
  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    return playlistResponse.data;
  } catch (error) {
    throw error;
  }
};
export async function fetchPlaylistDetails(playlistUrl: string) {
  const playlistId = playlistUrl.split("playlist/")[1].split("?si=")[0]

  const fetchPlaylistResponse = await fetchPlaylist(playlistId);
  const tracks = fetchPlaylistResponse.items.map((item: any) => {
    return {
      title: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name),
      addedBy: item.added_by.id
    };
  });
  return tracks;
}

export async function POST(request: Request) {
  const body = await request.json();

  const playlistUrl: string = body.playlistUrl as string;
  const gameDetails = getOrCreatePlaylist(docClient, playlistUrl, tableName);
  const playlistDetailsJson = fetchPlaylistDetails(playlistUrl);

  return Response.json(playlistDetailsJson);

}

async function createTable(tableName: string, playlistUrl: string) {
  const command = new PutCommand({
    TableName: tableName as string,
    Item: {
      playlistUrl: playlistUrl,
      leaderboard: {},
    },
  });
  const response = await docClient.send(command);
  return response
}

export async function PUT(request: Request) {
  const reqBodyJson = await request.json();

  const playlistUrl: string = reqBodyJson.playlistUrl as string;
  return await createTable(tableName, playlistUrl);
}

async function getOrCreatePlaylist(docClient, playlistUrl: string, tableName: string) {
  const getParams = {
    TableName: 'Playlists',
    Key: {
      playlistId: playlistUrl
    }
  };

  try {
    // Try to get the item
    const response = await docClient.get(getParams).promise();

    if (response.Item) {
      return response.Item;
    } else {
      // Item not found, attempt to create it
      const putParams = {
        TableName: tableName,
        Item: {
          playlistId: playlistUrl,
          createdAt: new Date().toISOString()
        },
        // Make the operation conditional on the item not existing
        ConditionExpression: 'attribute_not_exists(playlistId)'
      };

      await docClient.put(putParams).promise();
      return putParams.Item;
    }
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      // The item was created between the get and put operations, retrieve it
      const response = await docClient.get(getParams).promise();
      return response.Item;
    }
    console.error('Error in get or create operation:', error);
    throw error;
  }
}
