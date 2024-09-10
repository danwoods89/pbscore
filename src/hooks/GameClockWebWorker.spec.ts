import { act } from "@testing-library/react";
import { it, describe, beforeEach, vi, afterEach, expect } from "vitest";
import "@vitest/web-worker";

describe("GameClockWebWorker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should intialise a 10 minute timer", () => {
    // arrange
    const gameClockWebWorker = new Worker(new URL("./gameClockWebWorker.ts", import.meta.url), { type: "module" });

    // act
    gameClockWebWorker.postMessage(600000);

    // assert
    gameClockWebWorker.onmessage = (e) => {
      expect(e.data).toEqual(600000);
    };

    gameClockWebWorker.terminate();
  });

  const testCases = [
    [600000, 599000, 1000], // 1 second elapsed
    [600000, 500000, 60000], // 1 minute elapsed
    [600000, 300000, 300000], // 5 minutes elapsed
    [600000, 0, 600000], // 10 minutes elapsed
    [600000, 0, 900000], // 15 minutes elapsed
    [0, 0, 900000], // fd
    [600000, 342, 900000], // fd
  ];

  it.each(testCases)("should count down from %i ms to %i ms after %i ms", (gameTimeInMilliseconds, expectedMilliseconds, msToAdvance) => {
    // arrange
    const gameClockWebWorker = new Worker(new URL("./gameClockWebWorker.ts", import.meta.url), { type: "module" });

    // act
    gameClockWebWorker.postMessage(gameTimeInMilliseconds);

    // the passage of time
    act(() => {
      vi.advanceTimersByTime(msToAdvance);
    });

    // assert
    gameClockWebWorker.onmessage = (e: MessageEvent) => {
      expect(e.data).toEqual(expectedMilliseconds);
    };

    gameClockWebWorker.terminate();
  });
});
