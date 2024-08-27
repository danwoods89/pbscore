import { renderHook, act } from "@testing-library/react";
import useGameClock from "./useGameClockHook";
import { it, expect, describe, beforeEach, vi, afterEach } from "vitest";

describe("useGameClock hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should intialise a 10 minute timer", () => {
    // arrange & act
    const { result } = renderHook(() => useGameClock(600));

    // assert
    expect(result.current).toEqual(600000);
  });

  const testCases = [
    [10, 599, 1000], // 1 second
    [10, 500, 60000], // 1 minute
    [10, 300, 300000], // 5 minutes
    [10, 0, 600000], // 10 minutes
    [10, 0, 900000], // 15 minutes
  ];

  it.each(testCases)(
    "should count down from %i seconds to %i after %i ms",
    (initialMinutes, expectedSeconds, msToAdvance) => {
      // arrange
      const { result } = renderHook(() => useGameClock(initialMinutes));

      // act
      // the passage of time
      act(() => {
        vi.advanceTimersByTime(msToAdvance);
        vi.advanceTimersToNextFrame();
      });

      // assert
      expect(result.current).toEqual(expectedSeconds);
    }
  );
});
