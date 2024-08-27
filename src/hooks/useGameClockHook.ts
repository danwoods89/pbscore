import { useEffect, useState } from "react";

const useGameClock = (gameTimeInSeconds: number) => {
  const [timeLeft, setTimeLeft] = useState<number>(gameTimeInSeconds); // timeLeft in seconds

  useEffect(() => {
    const gameClockWebWorker = new Worker(
      new URL("./gameClockWebWorker.ts", import.meta.url),
      { type: "module" }
    );

    // give the web worker a starting time in seconds
    gameClockWebWorker.postMessage(gameTimeInSeconds);

    // listen for countdown messages
    gameClockWebWorker.onmessage = (e: MessageEvent) => {
      setTimeLeft(e.data);
    };

    // // Handle errors from the worker
    // gameClockWebWorker.onerror = (error) => {
    //   console.error("Worker error:", error);
    // };

    // cleanup
    return () => {
      gameClockWebWorker.terminate();
    };
  }, [gameTimeInSeconds]);

  return timeLeft;
};

export default useGameClock;
