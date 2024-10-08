import { useEffect, useState, useRef } from "react";
import StopwatchWebWorker from "./StopwatchWebWorker?worker";
import { StopwatchWebWorkerRequestMessageData, StopwatchWebWorkerResponseMessageData } from "./StopwatchWebWorker";

export interface Stopwatch {
  timeElapsedInMilliseconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const useStopwatch = (pollingIntervalInMilliseconds: number = 100): Stopwatch => {
  const [timeElapsedInMilliseconds, setTimeElapsedInMilliseconds] = useState<number>(0);
  const timeElapsedInMillisecondsRef = useRef<number>(0);
  const pollingIntervalInMillisecondsRef = useRef<number>(pollingIntervalInMilliseconds);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  useEffect(() => {
    if (isStarted) {
      const stopwatchWebWorker: Worker = new StopwatchWebWorker();
      const message: StopwatchWebWorkerRequestMessageData = { timeAlreadyElapsedInMilliseconds: timeElapsedInMillisecondsRef.current, pollingIntervalInMilliseconds: pollingIntervalInMillisecondsRef.current };
      stopwatchWebWorker.postMessage(message);

      // listen for countdown messages
      stopwatchWebWorker.onmessage = (message: MessageEvent<StopwatchWebWorkerResponseMessageData>) => {
        if (message.data.isError === true) {
          throw message.data.error;
        }

        setTimeElapsedInMilliseconds(message.data.timeElapsedInMilliseconds!);
      };

      stopwatchWebWorker.onerror = (event: ErrorEvent) => {
        throw event.error;
      };

      stopwatchWebWorker.onmessageerror = (event: MessageEvent) => {
        throw new Error(event.data);
      };

      return () => {
        stopwatchWebWorker.terminate();
      };
    }
  }, [isStarted]);

  useEffect(() => {
    timeElapsedInMillisecondsRef.current = timeElapsedInMilliseconds;
    pollingIntervalInMillisecondsRef.current = pollingIntervalInMilliseconds;
  }, [pollingIntervalInMilliseconds, timeElapsedInMilliseconds]);

  const start = () => {
    setIsStarted(true);
  };

  const stop = () => {
    setIsStarted(false);
  };

  const reset = () => {
    setTimeElapsedInMilliseconds(0);
    setIsStarted(false);
  };

  return { timeElapsedInMilliseconds, start, stop, reset };
};

export default useStopwatch;
