import axios from "axios";

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
    console.log(playlistResponse)
    return playlistResponse.data;
  } catch (error) {
    throw error;
  }
};
export async function POST(request: Request) {
  const formData = await request.json();
  const playlistUrl = formData.playlistId;
  const playlistId = playlistUrl.split("playlist/")[1].split("?si=")[0]

  console.log(playlistId);

  const fetchPlaylistResponse = await fetchPlaylist(playlistId);
  const tracks = fetchPlaylistResponse.items.map((item: any) => {
    return {
      title: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name),
      addedBy: item.added_by.id
    };
  });
  return Response.json(tracks);
}
