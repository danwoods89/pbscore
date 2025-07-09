import { useEffect, useState, useRef } from "react";
import GameClockWebWorker from "./GameClockWebWorker?worker";
import { GameClockWebWorkerRequestMessageData, GameClockWebWorkerResponseMessageData } from "./GameClockWebWorker";

export interface GameClock {
  timeRemainingInMilliseconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const useGameClock = (gameTimeInSeconds: number, pollingIntervalInMilliseconds: number = 100): GameClock => {
  const gameTimeInMilliseconds: number = gameTimeInSeconds * 1000;
  const [timeRemainingInMilliseconds, setTimeRemainingInMilliseconds] = useState<number>(gameTimeInMilliseconds); // timeLeft in milliseconds
  const timeRemainingInMillisecondsRef = useRef<number>(gameTimeInSeconds * 1000); // timeLeft in milliseconds
  const pollingIntervalInMillisecondsRef = useRef<number>(pollingIntervalInMilliseconds); // timeLeft in milliseconds
  const [isStarted, setIsStarted] = useState<boolean>(false);

  useEffect(() => {
    if (isStarted) {
      const gameClockWebWorker: Worker = new GameClockWebWorker();
      const message: GameClockWebWorkerRequestMessageData = { gameTimeInMilliseconds: timeRemainingInMillisecondsRef.current, pollingIntervalInMilliseconds: pollingIntervalInMillisecondsRef.current };
      gameClockWebWorker.postMessage(message);

      // listen for countdown messages
      gameClockWebWorker.onmessage = (message: MessageEvent<GameClockWebWorkerResponseMessageData>) => {
        if (message.data.isError === true) {
          throw message.data.error;
        }

        setTimeRemainingInMilliseconds(message.data.remainingTimeInMilliseconds!);
      };

      gameClockWebWorker.onerror = (event: ErrorEvent) => {
        throw event.error;
      };

      gameClockWebWorker.onmessageerror = (event: MessageEvent) => {
        throw new Error(event.data);
      };

      return () => {
        gameClockWebWorker.terminate();
      };
    }
  }, [isStarted]);

  useEffect(() => {
    timeRemainingInMillisecondsRef.current = timeRemainingInMilliseconds;
    pollingIntervalInMillisecondsRef.current = pollingIntervalInMilliseconds;
  }, [pollingIntervalInMilliseconds, timeRemainingInMilliseconds]);

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
