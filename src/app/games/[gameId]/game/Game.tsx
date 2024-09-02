import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from 'next/link'
import Image from 'next/image'

interface Artist {
  name: string;
}

interface Song {
  albumImageUrl: string;
  title: string;
  artists: string[];
  previewUrl: string;
}

interface CurrentSongToGuess {
  song: Song;
  personWhoAdded: string; // Used in setting `currentAnswer`
  potentialAdders: string[]; // Array of strings, as implied by the mapping
}

interface GameProps {
  openModal: () => void;
  setSessionScore: (score: number) => void;
}

export default function Game({ openModal, setSessionScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [pageError, setPageError] = useState("");
  const [currentSongToGuess, setCurrentSongToGuess] = useState<CurrentSongToGuess | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [guessedAdders, setGuessedAdders] = useState<string[]>([]);

  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const searchParams = new URLSearchParams(useSearchParams().toString());
  const options = searchParams.get('options') || "4";

  const fetchGame = useCallback(async (gameId: string) => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        body: JSON.stringify({ gameId, options }),
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (response.ok) {
        const responseData = await response.json();
        setCurrentSongToGuess(responseData);
        setCurrentAnswer(responseData.personWhoAdded);
      } else if (response.status === 404) {
        throw new Error("Game not found");
      } else {
        throw new Error("Failed to validate game id");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to create or find game. Double check your URL!");
        setPageError(error.message);
      }
    }
  }, [options]);

  useEffect(() => {
    fetchGame(gameId);
  }, [gameId, fetchGame]);

  useEffect(() => {
    if (shouldOpenModal) {
      setSessionScore(score);
      openModal();
      setShouldOpenModal(false);
    }
  }, [shouldOpenModal, score, setSessionScore, openModal]);

  function makeGuess(adder: string, answer: string) {
    if (guessedCorrectly) return;

    setGuessedAdders(prev => [...prev, adder]);

    if (adder === answer) {
      setScore(prev => prev + 1);
      setGuessedCorrectly(true);
    } else {
      setAttemptsLeft(prev => {
        const newAttempts = prev - 1;
        if (newAttempts === 0) {
          setShouldOpenModal(true);
          setGuessedCorrectly(true);
        }
        return newAttempts;
      });
    }
  }

  function nextSong() {
    fetchGame(gameId);
    setGuessedCorrectly(false);
    setGuessedAdders([]);
    setAttemptsLeft(3);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex justify-between items-center mb-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="flex space-x-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Attempts</p>
                  <p className="text-2xl font-semibold text-gray-900">{attemptsLeft}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{score}</p>
                </div>
              </div>
            </div>

            {currentSongToGuess ? (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-center text-gray-900">Guess Who Added the Song</h2>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <Image
                      src={currentSongToGuess.song.albumImageUrl}
                      alt="Album Cover"
                      width={150}
                      height={150}
                      className="rounded-lg shadow-md"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{currentSongToGuess.song.title}</h3>
                    <p className="text-gray-600">{currentSongToGuess.song.artists.join(', ')}</p>
                  </div>
                </div>
                <audio controls className="w-full" src={currentSongToGuess.song.previewUrl} />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {currentSongToGuess.potentialAdders.map((adder, index) => (
                    <button
                      key={index}
                      onClick={() => makeGuess(adder, currentAnswer)}
                      disabled={guessedCorrectly || guessedAdders.includes(adder)}
                      className={`
                        py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
                        ${guessedAdders.includes(adder)
                          ? adder === currentAnswer
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }
                        ${guessedCorrectly && adder !== currentAnswer ? 'opacity-50' : ''}
                        ${guessedCorrectly || guessedAdders.includes(adder) ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {adder}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={nextSong}
                  disabled={!guessedCorrectly && attemptsLeft > 0}
                  className={`
                    w-full py-3 px-4 rounded-md text-sm font-medium transition-all duration-200
                    ${guessedCorrectly && attemptsLeft > 0
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Next Song
                </button>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                {pageError ? (
                  <p className="text-red-500">Error: {pageError}</p>
                ) : (
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
