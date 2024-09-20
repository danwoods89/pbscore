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

  // it("should intialise a 10 minute timer", () => {
  //   // arrange
  //   expect.assertions(4);

  //   // act
  //   gameClockWebWorker!.postMessage(600000);

  //   // assert
  //   return new Promise<void>((resolve, reject) => {
  //     gameClockWebWorker!.onmessage = (e) => {
  //       try {
  //         expect(gameClockWebWorker).toBeDefined();
  //         expect(e).toBeInstanceOf(MessageEvent);
  //         expect(e.data).toBeDefined();
  //         expect(e.data).toBeTypeOf("number");
  //         resolve();
  //       } catch (err) {
  //         reject(err);
  //       }
  //     };
  //   });
  // });

  const testCases: [number, number, number, boolean][] = [
    [1000, 600000, 599000, true],
    [1000, 1000, 0, true],
    [1000, 600000, 300000, false],
  ];

  it.each(testCases)("should count down %i ms from %i ms to %i ms - %s", async (millisecondsToAdvance, gameTimeInMilliseconds, expectedMilliseconds, isCorrect) => {
    // arrange
    let totalMillisecondsAdvanced: number = 0;

    // act
    gameClockWebWorker!.postMessage(gameTimeInMilliseconds);

    // assert
    expect(gameClockWebWorker).toBeDefined();

    do {
      await new Promise<void>((resolve) => {
        gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
          expect(e).toBeInstanceOf(MessageEvent);
          expect(e.data).toBeTypeOf("number");
          // advance a tick
          await vi.advanceTimersByTimeAsync(100);
          expect(e.data).toBe(gameTimeInMilliseconds - totalMillisecondsAdvanced);
          totalMillisecondsAdvanced += 100;
          resolve();
        };
      });
    } while (totalMillisecondsAdvanced < millisecondsToAdvance);

    expect(gameTimeInMilliseconds - expectedMilliseconds === totalMillisecondsAdvanced).toBe(isCorrect);
  });

  // it("should not count down from 600000 ms to 300000 ms after 1000 ms", async () => {
  //   // arrange
  //   const gameTimeInMilliseconds = 600000;
  //   const millisecondsToAdvance = 1000;
  //   let totalMillisecondsAdvanced: number = 0;

  //   // act
  //   gameClockWebWorker!.postMessage(gameTimeInMilliseconds);

  //   do {
  //     // assert
  //     await new Promise<void>((resolve) => {
  //       gameClockWebWorker!.onmessage = async (e: MessageEvent) => {
  //         await vi.advanceTimersByTimeAsync(100);
  //         expect(e.data).toBe(gameTimeInMilliseconds - totalMillisecondsAdvanced);
  //         totalMillisecondsAdvanced += 100;
  //         resolve();
  //       };
  //     });
  //   } while (totalMillisecondsAdvanced < millisecondsToAdvance);

  //   expect(gameTimeInMilliseconds - totalMillisecondsAdvanced === 300000).toBe(false);
  // });
});
