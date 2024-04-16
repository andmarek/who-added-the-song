"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [playlistUrl, setPlaylistUrl] = useState("");

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const playlistId = playlistUrl.split("playlist/")[1].split("?si=")[0]
    router.push(`games/${playlistId}`)
  }


  return (
    <main className="z-100 flex min-h-screen flex-col items-center justify-between section-before relative overflow-hidden p-32">
      <div className="flex flex-col text-center justify-center">
        <h1 className="max-w-4xl my-2"> Guess the Contributor! </h1>
        <p className="max-w-2xl pt-2 self-center"> Insert a Spotify Playlist URL and try to guess who added what song! </p>
        <form
          className="my-5"
          onSubmit={(e) => {
            submitForm(e);
          }}
        >
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {" "}
            Enter the playlist URL:{" "}
          </h1>
          <div>
            <input
              className="text-black w-full"
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="Enter a Spotify Playlist URL to get started"
            />
            <div>
              <button type="submit">
                Start Game
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
