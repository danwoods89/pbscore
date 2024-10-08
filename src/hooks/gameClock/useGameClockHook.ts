import { useEffect, useState, useRef } from "react";
import GameClockWebWorker from "./GameClockWebWorker?worker";
import { GameClockWebWorkerRequestMessageData, GameClockWebWorkerResponseMessageData } from "./GameClockWebWorker";

export interface GameClock {
  remainingTimeInMilliseconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const useGameClock = (gameTimeInMilliseconds: number, pollingIntervalInMilliseconds: number = 100): GameClock => {
  const [remainingTimeInMilliseconds, setRemainingTimeInMilliseconds] = useState<number>(gameTimeInMilliseconds); // timeLeft in milliseconds
  const remainingTimeInMillisecondsRef = useRef<number>(gameTimeInMilliseconds);
  const pollingIntervalInMillisecondsRef = useRef<number>(pollingIntervalInMilliseconds); // polling interval in milliseconds
  const [isStarted, setIsStarted] = useState<boolean>(false);

  useEffect(() => {
    if (isStarted) {
      const gameClockWebWorker: Worker = new GameClockWebWorker();
      const message: GameClockWebWorkerRequestMessageData = { gameTimeInMilliseconds: remainingTimeInMillisecondsRef.current, pollingIntervalInMilliseconds: pollingIntervalInMillisecondsRef.current };
      gameClockWebWorker.postMessage(message);

      // listen for countdown messages
      gameClockWebWorker.onmessage = (message: MessageEvent<GameClockWebWorkerResponseMessageData>) => {
        if (message.data.isError === true) {
          throw message.data.error;
        }

        setRemainingTimeInMilliseconds(message.data.remainingTimeInMilliseconds!);
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
    remainingTimeInMillisecondsRef.current = remainingTimeInMilliseconds;
    pollingIntervalInMillisecondsRef.current = pollingIntervalInMilliseconds;

    if (remainingTimeInMillisecondsRef.current <= 0) {
      setIsStarted(false);
    }
  }, [pollingIntervalInMilliseconds, remainingTimeInMilliseconds]);

  const start = () => {
    setIsStarted(true);
  };

  const stop = () => {
    setIsStarted(false);
  };

  const reset = () => {
    setRemainingTimeInMilliseconds(gameTimeInMilliseconds);
    setIsStarted(false);
  };

  return { remainingTimeInMilliseconds, start, stop, reset };
};

export default useGameClock;
