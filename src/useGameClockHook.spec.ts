// @vitest-environment jsdom

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock web worker
vi.mock("./GameClockWebWorker?worker", () => {
  const postMessageMock = vi.fn();
  const terminateMock = vi.fn();

  class MockWorker {
    postMessage = postMessageMock;
    terminate = terminateMock;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    onerror: ((ev: ErrorEvent) => void) | null = null;
    onmessageerror: ((ev: MessageEvent) => void) | null = null;
  }

  const MockWorkerConstructor = vi.fn(() => new MockWorker());

  return {
    default: MockWorkerConstructor,
    __esModule: true,
    postMessageMock,
    terminateMock,
    MockWorkerConstructor,
  };
});

import useGameClockHook from "./useGameClockHook";
import * as WorkerModule from "./GameClockWebWorker?worker";

describe("useGameClockHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts the game clock and posts a message to the worker", () => {
    const { result } = renderHook(() => useGameClockHook(600, 100));
    act(() => result.current.start());

    expect(WorkerModule.default).toHaveBeenCalledTimes(1);
    // @ts-expect-error we know 'mock' property does not exist on the imported module
    expect(WorkerModule.default.mock.results[0].value.postMessage).toHaveBeenCalledWith({
      gameTimeInMilliseconds: 600_000,
      pollingIntervalInMilliseconds: 100,
    });
  });

  it("updates time remaining when receiving a message from the worker", () => {
    const { result } = renderHook(() => useGameClockHook(600, 100));
    act(() => result.current.start());

    // @ts-expect-error we know 'mock' property does not exist on the imported module
    const worker = WorkerModule.default.mock.results[0].value;
    act(() => {
      worker.onmessage?.({ data: { remainingTimeInMilliseconds: 590_000, isError: false } });
    });

    expect(result.current.timeRemainingInMilliseconds).toBe(590_000);
  });

  it("throws when the worker sends an error", () => {
    const { result } = renderHook(() => useGameClockHook(600, 100));
    act(() => result.current.start());

    // @ts-expect-error we know 'mock' property does not exist on the imported module
    const worker = WorkerModule.default.mock.results[0].value;

    expect(() =>
      act(() => {
        worker.onmessage?.({ data: { isError: true, errorMessage: "bad" } });
      })
    ).toThrow("bad");
  });

  it("terminates the worker on unmount", () => {
    const { result, unmount } = renderHook(() => useGameClockHook(600, 100));
    act(() => result.current.start());

    unmount();

    // @ts-expect-error we know 'mock' property does not exist on the imported module
    expect(WorkerModule.default.mock.results[0].value.terminate).toHaveBeenCalled();
  });

  it("stops the game clock", () => {
    const { result } = renderHook(() => useGameClockHook(600, 100));
    act(() => {
      result.current.start();
      result.current.stop();
    });

    expect(result.current.timeRemainingInMilliseconds).toBe(600_000);
  });
});
