import "@vitest/web-worker";
import { it, describe, beforeEach, vi, afterEach, expect } from "vitest";
import GameClockWebWorker from "./GameClockWebWorker?worker";
import { act } from "react";

let gameClockWebWorker: Worker | null = null;

describe("GameClockWebWorker", () => {
  beforeEach(() => {
    gameClockWebWorker = new GameClockWebWorker();
    vi.useFakeTimers();
  });

  afterEach(() => {
    gameClockWebWorker!.terminate();
  });

  it("should intialise a 10 minute timer", () => {
    // arrange
    expect.assertions(4);

    // act
    gameClockWebWorker!.postMessage(600000);

    // assert
    return new Promise<void>((resolve, reject) => {
      gameClockWebWorker!.onmessage = (e) => {
        try {
          expect(gameClockWebWorker).toBeDefined();
          expect(e).toBeInstanceOf(MessageEvent);
          expect(e.data).toBeDefined();
          expect(e.data).toBeTypeOf("number");
          resolve();
        } catch (err) {
          reject(err);
        }
      };
    });
  });

  const testCases = [
    [600000, 599000, 1000], // 1 second elapsed
    [600000, 500000, 60000], // 1 minute elapsed
    [600000, 300000, 300000], // 5 minutes elapsed
    [600000, 0, 600000], // 10 minutes elapsed
    [600000, 0, 900000], // 15 minutes elapsed
    [1, 1, 900000], // fd
    [600000, 342, 900000], // fd
  ];

  it.each(testCases)("should count down from %i ms to %i ms after %i ms", (gameTimeInMilliseconds, expectedMilliseconds, msToAdvance) => {
    // arrange
    expect.assertions(1);

    // act
    console.log(vi.getTimerCount());
    gameClockWebWorker!.postMessage(gameTimeInMilliseconds);

    // the passage of time
    act(() => {
      vi.advanceTimersByTime(msToAdvance);
    });

    // assert
    return new Promise<void>((resolve, reject) => {
      gameClockWebWorker!.onmessage = (e) => {
        try {
          expect(e.data).toBe(expectedMilliseconds);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
    });
  });
});
