import { it, describe, expect } from "vitest";
import getDriftAdjustedInterval from "./GameClockWebWorkerDriftHelper";

describe("GameClockWebWorkerDriftHelper", () => {
  const testCases = [
    [100, 24547541.164, 24547641.164, 100], // no drift
    [100, 24547541.164, 24547640.164, 101], // interval went faster 99ms, so slow the next interval down to 101ms
    [100, 24547541.164, 24547642.164, 99], // interval went slower 101ms, so speed the next interval up to 99ms
  ];

  it.each(testCases)("should calculate an interval of %i ms going from %i ms to %i ms returns a drift-adjusted time of %i ms", (intervalTimeInMilliseconds, previousTimeInMillseconds, currentTimeInMilliseconds, expectedDriftTimeInMilliseconds) => {
    // arrange & act
    const result = getDriftAdjustedInterval(intervalTimeInMilliseconds, previousTimeInMillseconds, currentTimeInMilliseconds);

    // assert
    expect(result).toEqual(expectedDriftTimeInMilliseconds);
  });
});
