import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddb);

const tableName = process.env.TABLE_NAME as string

async function getAccessToken() {
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
  return accessToken;
}

async function fetchPlaylistTracks(playlistId: string, accessToken: string) {
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

    // ?offset={}&limit=100
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    console.log(playlistResponse.data)
    return playlistResponse.data;
  } catch (error) {
    throw error;
  }
};

function getRandomCollaborators(size: number, tracks, actualCollaborator) {
  const collaborators = new Set(); // Using a Set to avoid duplicates
  while (collaborators.size < size) {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const collaboratorId = tracks[randomIndex].addedBy.id;
    // Ensure the actual collaborator is not added to the list
    if (collaboratorId !== actualCollaborator) {
      collaborators.add(collaboratorId);
    }
  }
  return Array.from(collaborators); // Convert the Set back to an Array before returning
}

async function getUserProfile(userId: string, accessToken: string) {
  try {
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/users/${userId}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    console.log(playlistResponse.data)
    return playlistResponse.data;
  } catch (error) {
    throw error;
  }
}

async function fetchPlaylistDetails(playlistId: string, accessToken: string) {
  const fetchPlaylistResponse = await fetchPlaylistTracks(playlistId, accessToken);
  console.log("PLAYLIST RESP");
  console.log(fetchPlaylistResponse);

  const tracks = fetchPlaylistResponse.items.map((item: any) => {
    return {
      title: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name),
      addedBy: item.added_by,
      external: item.added_by.external_urls,
      previewUrl: item.track.preview_url,
      albumImageUrl: item.track.album.images[0].url,
    };
  });
  return tracks;
}

async function getOrCreatePlaylist(docClient: any, playlistId: string, tableName: string) {
  try {
    // Try to get the item
    console.log("getting the table stuff")
    const response = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: {
        playlistId: playlistId
      }
    }));

    console.log("after getting the table stuff")
    if (response.Item) {
      console.log('Item found:', response.Item);
      return response.Item;
    } else {
      // Item not found, attempt to create it
      console.log("itme not found")
      const putParams = {
        TableName: tableName,
        Item: {
          playlistId: playlistId,
          leaderboard: {},
          createdAt: new Date().toISOString()
        },
        // Make the operation conditional on the item not existing
        ConditionExpression: 'attribute_not_exists(playlistId)'
      };


      console.log("putting")
      await docClient.send(new PutCommand(putParams));
      return putParams.Item;
    }
  } catch (error: any) {
    if (error.code === 'ConditionalCheckFailedException') {
      // The item was created between the get and put operations, retrieve it
      const params = {
        TableName: tableName,
        Key: {
          playlistId
        }
      }
      const response = await docClient.send(params);
      console.log('Item retrieved after conditional failure:', response.Item);
      return response.Item;
    }
    console.error('Error in get or create operation:', error);
    throw error;
  }
}


function getRandomSong(spotifyData: any) {
  const randomIndex = Math.floor(Math.random() * spotifyData.length);
  return spotifyData[randomIndex];
}


export async function POST(request: Request) {
  const body = await request.json();

  const gameId = body.gameId; // TODO: why is this necessary actually???
  const options = body.options;

  console.log("real game id", gameId);
  const getAccessTokenResponse = await getAccessToken();

  const getOrCreateResponse = await getOrCreatePlaylist(docClient, gameId, tableName);

  const playlistDetailsJson = await fetchPlaylistDetails(gameId, getAccessTokenResponse);

  console.log(playlistDetailsJson.total);

  const randomSong = getRandomSong(playlistDetailsJson);

  const getUserProfileResponse = await getUserProfile(randomSong.addedBy.id, getAccessTokenResponse);
  const personWhoAdded = getUserProfileResponse.display_name;

  const randomCollaboratorsIds = getRandomCollaborators(options - 1, playlistDetailsJson, randomSong.addedBy.id);

  const randomCollaboratorsDisplayNames = await Promise.all(randomCollaboratorsIds.map(async (collaboratorId: string) => {
    const collaboratorProfile = await getUserProfile(collaboratorId, getAccessTokenResponse);
    return collaboratorProfile.display_name;
  }));

  randomCollaboratorsDisplayNames.splice((randomCollaboratorsDisplayNames.length + 1) * Math.random() | 0, 0, personWhoAdded);

  const apiResponse = {
    gameDetails: getOrCreateResponse,
    song: randomSong as string,
    personWhoAdded: personWhoAdded as string,
    potentialAdders: randomCollaboratorsDisplayNames as string[]
  }
  console.log(getAccessTokenResponse);
  return Response.json(apiResponse);
}
