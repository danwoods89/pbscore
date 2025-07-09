import getDriftAdjustedInterval from "./GameClockWebWorkerDriftHelper";

export interface GameClockWebWorkerRequestMessageData {
  gameTimeInMilliseconds: number;
  pollingIntervalInMilliseconds: number;
}

export interface GameClockWebWorkerResponseMessageData {
  remainingTimeInMilliseconds: number | undefined;
  isError: boolean;
  error: Error | undefined;
}

class GameClockWebWorker {
  private _initialised: boolean = false;
  private _pollingIntervalInMilliseconds: number | undefined;

  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  private onMessage(message: MessageEvent<GameClockWebWorkerRequestMessageData>) {
    // assertions
    if (this._initialised !== false) this.postError(new Error());
    if (!message?.data) this.postError(ReferenceError());
    this.assert(message.data);

    // set the polling interval
    this._pollingIntervalInMilliseconds = message.data.pollingIntervalInMilliseconds;

    // start counting down
    this.startGameClock(message.data.gameTimeInMilliseconds);
  }

  private startGameClock(gameTimeInMilliseconds: number): void {
    this._initialised = true;
    const startTimeInMilliseconds: number = performance.now();
    // updated each tick
    let isFirstTick = true;
    let currentTimeInMilliseconds: number = startTimeInMilliseconds;
    let previousTimeInMilliseconds: number = startTimeInMilliseconds;

    const tick = () => {
      previousTimeInMilliseconds = currentTimeInMilliseconds;
      currentTimeInMilliseconds = performance.now();

      // time elapsed since the timer was started
      const timeElapsedInMilliseconds: number = currentTimeInMilliseconds - startTimeInMilliseconds;

      // remaining time is the total game time minus the time elapsed
      const remainingTimeInMilliseconds: number = gameTimeInMilliseconds - timeElapsedInMilliseconds;

      let timeoutId: number | null = null;

      // while there is still game time
      if (remainingTimeInMilliseconds > 0) {
        const message: GameClockWebWorkerResponseMessageData = { remainingTimeInMilliseconds, isError: false, error: undefined };
        self.postMessage(message);
        timeoutId = self.setTimeout(tick, isFirstTick ? this._pollingIntervalInMilliseconds : getDriftAdjustedInterval(this._pollingIntervalInMilliseconds!, previousTimeInMilliseconds, currentTimeInMilliseconds));
      } else {
        if (timeoutId) self.clearTimeout(timeoutId!);
      }

      isFirstTick = false;
    };

    tick();
  }

  private assert(data: GameClockWebWorkerRequestMessageData) {
    if (!data.gameTimeInMilliseconds) this.postError(new ReferenceError());
    if (typeof data.gameTimeInMilliseconds !== "number") this.postError(new TypeError());
    if (!data.pollingIntervalInMilliseconds) this.postError(new ReferenceError());
    if (typeof data.pollingIntervalInMilliseconds !== "number") this.postError(new TypeError());
    if (data.gameTimeInMilliseconds <= 0 || data.gameTimeInMilliseconds > Number.MAX_SAFE_INTEGER) this.postError(new RangeError());
    if (data.pollingIntervalInMilliseconds <= 0 || data.pollingIntervalInMilliseconds > Number.MAX_SAFE_INTEGER) this.postError(new RangeError());
  }

  private postError(error: Error) {
    // post errors back to the main thread as
    // testing framework considers exceptions
    // sent back via 'onerror' as unhandled
    const message: GameClockWebWorkerResponseMessageData = { remainingTimeInMilliseconds: undefined, isError: true, error: error };
    self.postMessage(message);
    self.close();
  }
}

new GameClockWebWorker();
