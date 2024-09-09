import { act } from "@testing-library/react";
import { it, describe, beforeEach, vi, afterEach } from "vitest";
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
    const gameClockWebWorker = new Worker(
      new URL("./gameClockWebWorker.ts", import.meta.url),
      { type: "module" }
    );

    // act
    gameClockWebWorker.postMessage(600);

    // assert
    gameClockWebWorker.onmessage = (e) => {
      e.data.toEqual(600);
    };

    gameClockWebWorker.terminate();
  });

  const testCases = [
    [600, 599, 1000], // 1 second elapsed
    [600, 500, 60000], // 1 minute elapsed
    [600, 300, 300000], // 5 minutes elapsed
    [600, 0, 600000], // 10 minutes elapsed
    [600, 0, 900000], // 15 minutes elapsed
  ];

  it.each(testCases)(
    "should count down from %i seconds to %i after %i ms",
    (gameTimeInSeconds, expectedSeconds, msToAdvance) => {
      // arrange
      const gameClockWebWorker = new Worker(
        new URL("./gameClockWebWorker.ts", import.meta.url),
        { type: "module" }
      );

      // act
      gameClockWebWorker.postMessage(gameTimeInSeconds);

      // the passage of time
      act(() => {
        vi.advanceTimersByTime(msToAdvance);
      });

      // assert
      gameClockWebWorker.onmessage = (e) => {
        e.data.toEqual(expectedSeconds);
      };

      gameClockWebWorker.terminate();
    }
  );
});
