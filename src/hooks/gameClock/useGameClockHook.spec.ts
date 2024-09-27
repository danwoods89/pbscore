import { renderHook, act } from "@test";
import GameClockWebWorker from "./GameClockWebWorker?worker";
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest";
import useGameClockHook from "./useGameClockHook";

// Mock the web worker
vi.mock("./GameClockWebWorker?worker", () => {
  return vi.fn(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: undefined,
    onerror: undefined,
    onmessageerror: undefined,
  }));
});

describe("useGameClock", () => {
  const gameTimeInSeconds = 600; // 10 minutes in seconds
  const pollingIntervalInMilliseconds = 100;

  beforeEach(() => {
    vi.useFakeTimers(); // Mock timers for predictable setTimeout behavior
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  it("should initialize with the full game time", () => {
    const { result } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    expect(result.current.timeRemainingInMilliseconds).toBe(gameTimeInSeconds * 1000);
  });

  it("should start the game clock when start is called", () => {
    const { result } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    act(() => {
      result.current.start();
    });

    expect(GameClockWebWorker).toHaveBeenCalled();
    expect(result.current.timeRemainingInMilliseconds).toBe(gameTimeInSeconds * 1000);
  });

  it("should stop the game clock when stop is called", () => {
    const { result } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    act(() => {
      result.current.start();
      result.current.stop();
    });

    expect(result.current.timeRemainingInMilliseconds).toBe(gameTimeInSeconds * 1000); // Should still be full since no time has passed in fake timers
  });

  it("should reset the game clock when reset is called", () => {
    const { result } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    act(() => {
      result.current.start();
      result.current.reset();
    });

    expect(result.current.timeRemainingInMilliseconds).toBe(gameTimeInSeconds * 1000);
    expect(GameClockWebWorker).toHaveBeenCalledTimes(1); // Worker should start once and be terminated on reset
  });

  it("should update the time remaining when receiving messages from the web worker", () => {
    const { result } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    act(() => {
      result.current.start();
    });

    const webWorkerInstance = GameClockWebWorker.mock.results[0].value;
    const remainingTime = 500000; // Some arbitrary time remaining in milliseconds

    act(() => {
      webWorkerInstance.onmessage({ data: { remainingTimeInMilliseconds: remainingTime, isError: false } });
    });

    expect(result.current.timeRemainingInMilliseconds).toBe(remainingTime);
  });

  it("should handle errors from the web worker", () => {
    const { result } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    act(() => {
      result.current.start();
    });

    const webWorkerInstance = GameClockWebWorker.mock.results[0].value;
    const errorMessage = "An error occurred";

    expect(() => {
      act(() => {
        webWorkerInstance.onmessage({ data: { isError: true, error: new Error(errorMessage) } });
      });
    }).toThrow(errorMessage);
  });

  it("should terminate the web worker when unmounted", () => {
    const { result, unmount } = renderHook(() => useGameClockHook(gameTimeInSeconds, pollingIntervalInMilliseconds));

    act(() => {
      result.current.start();
    });

    const webWorkerInstance = GameClockWebWorker.mock.results[0].value;

    unmount();

    expect(webWorkerInstance.terminate).toHaveBeenCalled();
  });
});
