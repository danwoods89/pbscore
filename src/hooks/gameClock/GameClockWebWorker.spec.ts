import "@vitest/web-worker";
import { it, describe, beforeEach, vi, afterEach, expect } from "vitest";
import GameClockWebWorker from "./GameClockWebWorker?worker";

let gameClockWebWorker: Worker | null = null;

describe("GameClockWebWorker", () => {
  beforeEach(() => {
    gameClockWebWorker = new GameClockWebWorker();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    gameClockWebWorker!.terminate();
  });

  const countDownCases: [number, number, number, boolean][] = [
    [1000, 600000, 599000, true],
    [1000, 1000, 0, true],
    [1000, 600000, 300000, false],
  ];

  it.each(countDownCases)("should count down %i ms from %i ms to %i ms - %s", async (millisecondsToAdvance, gameTimeInMilliseconds, expectedMilliseconds, isValid) => {
    // arrange
    let totalMillisecondsAdvanced: number = 0;

    // act
    gameClockWebWorker!.postMessage(gameTimeInMilliseconds);

    // assert
    expect(gameClockWebWorker).toBeDefined();

    do {
      await new Promise<void>((resolve) => {
        gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
          expect(e.data).toBeTypeOf("number");
          // advance a tick
          await vi.advanceTimersByTimeAsync(100);
          expect(e.data).toBe(gameTimeInMilliseconds - totalMillisecondsAdvanced);
          expect(e.data.isError).toBeUndefined();
          expect(e.data.error).toBeUndefined();
          totalMillisecondsAdvanced += 100;
          resolve();
        };
      });
    } while (totalMillisecondsAdvanced < millisecondsToAdvance);

    expect(gameTimeInMilliseconds - expectedMilliseconds === totalMillisecondsAdvanced).toBe(isValid);
  });

  const invalidCases: [number | null | undefined | string][] = [[0], [-1], [null], [undefined], ["test"]];
  it.each(invalidCases)("should receive an error when message is %s", async (gameTimeInMilliseconds) => {
    // arrange
    // act
    gameClockWebWorker!.postMessage(gameTimeInMilliseconds);

    // assert
    await new Promise<void>((resolve) => {
      gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
        expect(e.data.isError).toBe(true);
        expect(e.data.error).toBeDefined();
        resolve();
      };
    });
  });

  it("should receive an error when worker is already initialised", async () => {
    // arrange
    // - post the first message
    gameClockWebWorker!.postMessage(1000);
    let runCount = 0;

    // act
    // - post a second message
    gameClockWebWorker!.postMessage(1000);

    // assert
    await new Promise<void>((resolve) => {
      gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
        runCount++;
        if (runCount == 1) {
          expect(e.data.isError).toBeUndefined();
          expect(e.data.error).toBeUndefined();
        }

        if (runCount > 1) {
          expect(e.data.isError).toBe(true);
          expect(e.data.error).toBeDefined();
        }
        resolve();
      };
    });
  });
});
