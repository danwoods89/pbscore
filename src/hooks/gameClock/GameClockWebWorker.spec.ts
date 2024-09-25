import "@vitest/web-worker";
import { it, describe, beforeEach, vi, afterEach, expect } from "vitest";
import GameClockWebWorker from "./GameClockWebWorker?worker";
import { GameClockWebWorkerRequestMessageData, GameClockWebWorkerResponseMessageData } from "./GameClockWebWorker";

let gameClockWebWorker: Worker | null = null;

describe("GameClockWebWorker", () => {
  beforeEach(() => {
    gameClockWebWorker = new GameClockWebWorker();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    gameClockWebWorker!.terminate();
  });

  const countdownCases: [number, number, number, boolean][] = [
    [1000, 600000, 599000, true],
    [1000, 1000, 0, true],
    [1000, 600000, 300000, false],
  ];
  it.each(countdownCases)("should count down %i ms from %i ms to %i ms - %s", async (millisecondsToAdvance, gameTimeInMilliseconds, expectedMilliseconds, isValid) => {
    // arrange
    let totalMillisecondsAdvanced: number = 0;
    const message: GameClockWebWorkerRequestMessageData = { gameTimeInMilliseconds, pollingIntervalInMilliseconds: 100 };

    // act
    gameClockWebWorker!.postMessage(message);

    // assert
    expect(gameClockWebWorker).toBeDefined();

    do {
      await new Promise<void>((resolve) => {
        gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
          const data: GameClockWebWorkerResponseMessageData = e.data as GameClockWebWorkerResponseMessageData;
          // advance a tick
          await vi.advanceTimersByTimeAsync(100);
          expect(data.remainingTimeInMilliseconds).toBe(gameTimeInMilliseconds - totalMillisecondsAdvanced);
          expect(data.isError).toBe(false);
          expect(data.error).toBeUndefined();
          totalMillisecondsAdvanced += 100;
          resolve();
        };
      });
    } while (totalMillisecondsAdvanced < millisecondsToAdvance);

    expect(gameTimeInMilliseconds - expectedMilliseconds === totalMillisecondsAdvanced).toBe(isValid);
  });

  const invalidCases: [number | undefined, number | undefined][] = [
    [undefined, 100],
    [0, 100],
    [-1, 100],
    [Number.MAX_SAFE_INTEGER + 1, 100],
    [1, 0],
    [1, -1],
    [1, Number.MAX_SAFE_INTEGER + 1],
    [undefined, undefined],
  ];
  it.each(invalidCases)("should receive an error when gameTimeInMilliseconds is %s and pollingIntervalInMilliseconds is %s", async (gameTimeInMilliseconds, pollingIntervalInMilliseconds) => {
    // arrange
    const message = { gameTimeInMilliseconds, pollingIntervalInMilliseconds };

    // act
    gameClockWebWorker!.postMessage(message);

    // assert
    await new Promise<void>((resolve) => {
      gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
        expect(e.data.isError).toBe(true);
        expect(e.data.error).toBeDefined();
        resolve();
      };
    });
  });

  const validCases: [number | undefined, number | undefined][] = [
    [1, undefined],
    [1, 1],
    [1, 100],
  ];
  it.each(validCases)("should not receive an error when gameTimeInMilliseconds is %s and pollingIntervalInMilliseconds is %s", async (gameTimeInMilliseconds, pollingIntervalInMilliseconds) => {
    // arrange
    const message = { gameTimeInMilliseconds, pollingIntervalInMilliseconds };

    // act
    gameClockWebWorker!.postMessage(message);

    // assert
    await new Promise<void>((resolve) => {
      gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
        expect(e.data.isError).toBe(false);
        expect(e.data.error).toBeUndefined();
        resolve();
      };
    });
  });

  it("should receive an error when worker is already initialised", async () => {
    // arrange
    const message: GameClockWebWorkerRequestMessageData = { gameTimeInMilliseconds: 1000, pollingIntervalInMilliseconds: 100 };

    // - post the first message
    gameClockWebWorker!.postMessage(message);
    let runCount = 0;

    // act
    // - post a second message
    gameClockWebWorker!.postMessage(message);

    // assert
    await new Promise<void>((resolve) => {
      gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
        const data: GameClockWebWorkerResponseMessageData = e.data as GameClockWebWorkerResponseMessageData;
        runCount++;
        if (runCount == 1) {
          expect(data.remainingTimeInMilliseconds).toBeDefined();
          expect(data.isError).toBe(false);
          expect(data.error).toBeUndefined();
        }

        if (runCount > 1) {
          expect(data.remainingTimeInMilliseconds).toBeUndefined();
          expect(data.isError).toBe(true);
          expect(data.error).toBeDefined();
        }
        resolve();
      };
    });
  });
});
