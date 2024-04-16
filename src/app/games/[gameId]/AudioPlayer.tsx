import React, { useState, useRef } from 'react';

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null); // Reference to the audio element
  const [isPlaying, setIsPlaying] = useState(false); // State to track play status

  // Play the audio
  const play = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  // Pause the audio
  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <div>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
