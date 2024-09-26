import { useEffect, useState, useRef } from "react";
import GameClockWebWorker from "./GameClockWebWorker?worker";
import { GameClockWebWorkerRequestMessageData, GameClockWebWorkerResponseMessageData } from "./GameClockWebWorker";

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
      const gameClockWebWorker: Worker = new GameClockWebWorker();
      const message: GameClockWebWorkerRequestMessageData = { gameTimeInMilliseconds: timeRemainingInMillisecondsRef.current };
      gameClockWebWorker.postMessage(message);

      // listen for countdown messages
      gameClockWebWorker.onmessage = (message: MessageEvent<GameClockWebWorkerResponseMessageData>) => {
        if (message.data.isError === true) {
          const error = message.data.error as Error;
          throw error;
        }

        setTimeRemainingInMilliseconds(message.data.remainingTimeInMilliseconds!);
      };

      gameClockWebWorker.onerror = (event: ErrorEvent) => {
        throw new Error(event.message);
      };

      return () => {
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
