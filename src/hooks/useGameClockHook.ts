import { useEffect, useState, useRef } from "react";

export interface GameClock {
  timeRemainingInMilliseconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const useGameClock = (gameTimeInSeconds: number): GameClock => {
  const gameTimeInMilliseconds: number = gameTimeInSeconds * 1000;
  const [timeRemainingInMilliseconds, setTimeRemainingInMilliseconds] = useState<number>(gameTimeInMilliseconds); // timeLeft in milliseconds
  const timeRemainingInMillisecondsRef = useRef<number>(gameTimeInSeconds * 1000); // timeLeft in milliseconds
  const [isStarted, setIsStarted] = useState<boolean>(false);

  useEffect(() => {
    if (isStarted) {
      const gameClockWebWorker: Worker = new Worker(new URL("./gameClockWebWorker.ts", import.meta.url), { type: "module" });

      gameClockWebWorker.postMessage(timeRemainingInMillisecondsRef.current);

      // listen for countdown messages
      gameClockWebWorker.onmessage = (e: MessageEvent) => {
        setTimeRemainingInMilliseconds(e.data as number);
      };

      return () => {
        console.log("terminated");
        gameClockWebWorker.terminate();
      };
    }
  }, [isStarted]);

  useEffect(() => {
    timeRemainingInMillisecondsRef.current = timeRemainingInMilliseconds;
  }, [timeRemainingInMilliseconds]);

  const start = () => {
    setIsStarted(true);
  };

  const stop = () => {
    setIsStarted(false);
  };

  const reset = () => {
    setTimeRemainingInMilliseconds(gameTimeInMilliseconds);
    setIsStarted(false);
  };

  return { timeRemainingInMilliseconds, start, stop, reset };
};

export default useGameClock;
