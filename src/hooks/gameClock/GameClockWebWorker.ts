import getDriftAdjustedInterval from "./GameClockWebWorkerDriftHelper";

const DELAY_IN_MILLISECONDS: number = 100;

class GameClockWebWorker {
  private _initialised: boolean = false;

  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  private onMessage(message: MessageEvent) {
    // assertions
    if (this._initialised !== false) this.postError(new Error());
    if (!message.data) this.postError(ReferenceError());
    if (typeof message.data !== "number") this.postError(new TypeError());
    if (message.data <= 0) this.postError(new RangeError());

    // start counting down
    this.startGameClock(message.data as number, DELAY_IN_MILLISECONDS);
  }

  private postError(error: Error) {
    // post errors back to the main thread as
    // testing framework considers exceptions
    // sent back via 'onerror' as unhandled
    console.error(error);
    self.postMessage({ isError: true, error: error });
    self.close();
  }

  private startGameClock(gameTimeInMilliseconds: number, delayInMilliseconds: number): void {
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
        self.postMessage(remainingTimeInMilliseconds);
        timeoutId = self.setTimeout(tick, isFirstTick ? delayInMilliseconds : getDriftAdjustedInterval(delayInMilliseconds, previousTimeInMilliseconds, currentTimeInMilliseconds));
      } else {
        if (timeoutId) self.clearTimeout(timeoutId!);
      }

      isFirstTick = false;
    };

    tick();
  }
}

new GameClockWebWorker();
