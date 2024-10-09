import "@vitest/web-worker";
import { it, describe, beforeEach, vi, afterEach, expect } from "vitest";
import StopwatchWebWorker from "./StopwatchWebWorker?worker";
import { StopwatchWebWorkerRequestMessageData, StopwatchWebWorkerResponseMessageData } from "./StopwatchWebWorker";

let stopwatchWebWorker: Worker | null = null;

describe("StopwatchWebWorker", () => {
  beforeEach(() => {
    stopwatchWebWorker = new StopwatchWebWorker();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    stopwatchWebWorker!.terminate();
  });

  const stopwatchCases: [number, number, number, boolean][] = [
    [1000, 0, 1000, true],
    [1000, 1000, 2000, true],
    [1000, 0, 2000, false],
  ];
  it.each(stopwatchCases)("should count up %i ms from %i ms to %i ms - %s", async (millisecondsToAdvance, timeAlreadyElapsedInMilliseconds, expectedMilliseconds, isValid) => {
    // arrange
    let totalMillisecondsAdvanced: number = 0;
    const pollingIntervalInMilliseconds = 100;
    const message: StopwatchWebWorkerRequestMessageData = { timeAlreadyElapsedInMilliseconds, pollingIntervalInMilliseconds: pollingIntervalInMilliseconds };

    // act
    stopwatchWebWorker!.postMessage(message);

    // assert
    expect(stopwatchWebWorker).toBeDefined();

    while (totalMillisecondsAdvanced < millisecondsToAdvance) {
      await new Promise<void>((resolve) => {
        stopwatchWebWorker!.onmessage = async (e: MessageEvent) => {
          const data: StopwatchWebWorkerResponseMessageData = e.data as StopwatchWebWorkerResponseMessageData;
          // advance a tick
          await vi.advanceTimersByTimeAsync(pollingIntervalInMilliseconds);
          expect(data.timeElapsedInMilliseconds).toBe(totalMillisecondsAdvanced + timeAlreadyElapsedInMilliseconds);
          expect(data.isError).toBe(false);
          expect(data.error).toBeUndefined();
          totalMillisecondsAdvanced += pollingIntervalInMilliseconds;
          resolve();
        };
      });
    }

    expect(expectedMilliseconds === totalMillisecondsAdvanced + timeAlreadyElapsedInMilliseconds).toBe(isValid);
  });

  const invalidCases: [number | null | undefined | string, number | null | undefined | string][] = [
    [undefined, 1],
    [null, 1],
    [-1, 1],
    [Number.MAX_SAFE_INTEGER + 1, 1],
    ["test", 1],
    [1, undefined],
    [1, null],
    [1, 0],
    [1, -1],
    [1, Number.MAX_SAFE_INTEGER + 1],
    [1, "test"],
    [undefined, undefined],
    [null, null],
  ];
  it.each(invalidCases)("should receive an error when timeAlreadyElapsedInMilliseconds is %s and pollingIntervalInMilliseconds is %s", async (timeAlreadyElapsedInMilliseconds, pollingIntervalInMilliseconds) => {
    // arrange
    const message = { timeAlreadyElapsedInMilliseconds, pollingIntervalInMilliseconds };

    // act
    stopwatchWebWorker!.postMessage(message);

    // assert
    await new Promise<void>((resolve) => {
      stopwatchWebWorker!.onmessage = async (e: MessageEvent) => {
        expect(e.data.isError).toBe(true);
        expect(e.data.error).toBeDefined();
        resolve();
      };
    });
  });

  it("should not receive an error when timeAlreadyElapsedInMilliseconds is 0 and pollingIntervalInMilliseconds is 1", async () => {
    // arrange
    const message: StopwatchWebWorkerRequestMessageData = { timeAlreadyElapsedInMilliseconds: 0, pollingIntervalInMilliseconds: 1 };

    // act
    stopwatchWebWorker!.postMessage(message);

    // assert
    await new Promise<void>((resolve) => {
      stopwatchWebWorker!.onmessage = async (e: MessageEvent) => {
        expect(e.data.isError).toBe(false);
        expect(e.data.error).toBeUndefined();
        resolve();
      };
    });
  });

  it("should receive an error when worker is already initialised", async () => {
    // arrange
    const message: StopwatchWebWorkerRequestMessageData = { timeAlreadyElapsedInMilliseconds: 1000, pollingIntervalInMilliseconds: 100 };

    // - post the first message
    stopwatchWebWorker!.postMessage(message);
    let runCount = 0;

    // act
    // - post a second message
    stopwatchWebWorker!.postMessage(message);

    // assert
    await new Promise<void>((resolve) => {
      stopwatchWebWorker!.onmessage = async (e: MessageEvent) => {
        const data: StopwatchWebWorkerResponseMessageData = e.data as StopwatchWebWorkerResponseMessageData;
        runCount++;
        if (runCount == 1) {
          expect(data.timeElapsedInMilliseconds).toBeDefined();
          expect(data.isError).toBe(false);
          expect(data.error).toBeUndefined();
        }

        if (runCount > 1) {
          expect(data.timeElapsedInMilliseconds).toBeUndefined();
          expect(data.isError).toBe(true);
          expect(data.error).toBeDefined();
        }
        resolve();
      };
    });
  });
});
