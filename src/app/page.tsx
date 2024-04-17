"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import {
  Heading,
  Button,
  Text,
  Input,
  Stack,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'


export default function Home() {
  const router = useRouter();
  const [playlistUrl, setPlaylistUrl] = useState("");

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    if (playlistUrl.length != 0) {
      e.preventDefault();
      const playlistId = playlistUrl.split("playlist/")[1].split("?si=")[0]
      router.push(`games/${playlistId}?options=4`)
    } else {
      alert("Please enter a valid Spotify Playlist URL")
    }
  }


  return (
    <main className="z-100 flex min-h-screen flex-col items-center justify-between section-before relative overflow-hidden p-32">
      <div className="flex flex-col text-center justify-center">
        <Heading> Guess the Contributor </Heading>
        <p className="max-w-2xl pt-2 self-center"> Insert a Spotify Playlist URL and try to guess who added what song! </p>
        <form
          className="my-5"
          onSubmit={(e) => {
            submitForm(e);
          }}
        >
          <Stack>
            <Flex className="space-x-2">
              <Input
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="Enter a Spotify Playlist URL to get started"
              />
              <NumberInput step={1} defaultValue={4} min={2} max={5}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Button type="submit" colorScheme='teal' size='xs'>
              Let&apos;s Go!
            </Button>
          </Stack>
        </form>
      </div>
    </main>
  )
}
