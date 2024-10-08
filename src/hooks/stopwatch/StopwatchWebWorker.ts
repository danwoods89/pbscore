import getDriftAdjustedInterval from "../../utils/DriftHelper";

export interface StopwatchWebWorkerRequestMessageData {
  timeAlreadyElapsedInMilliseconds: number;
  pollingIntervalInMilliseconds: number;
}

export interface StopwatchWebWorkerResponseMessageData {
  timeElapsedInMilliseconds: number | undefined;
  isError: boolean;
  error: Error | undefined;
}

class StopwatchWebWorker {
  private _initialised: boolean = false;
  private _pollingIntervalInMilliseconds: number | undefined;

  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  private onMessage(message: MessageEvent<StopwatchWebWorkerRequestMessageData>) {
    // assertions
    if (this._initialised !== false) this.postError(new Error());
    if (!message?.data) this.postError(ReferenceError());
    this.assert(message.data);

    // set the polling interval
    this._pollingIntervalInMilliseconds = message.data.pollingIntervalInMilliseconds;

    // start counting down
    this.startStopwatch(message.data.timeAlreadyElapsedInMilliseconds!);
  }

  private startStopwatch(timeAlreadyElapsedInMilliseconds: number): void {
    this._initialised = true;
    const startTimeInMilliseconds: number = performance.now() - timeAlreadyElapsedInMilliseconds;
    // updated each tick
    let isFirstTick = true;
    let currentTimeInMilliseconds: number = startTimeInMilliseconds;
    let previousTimeInMilliseconds: number = startTimeInMilliseconds;

    const tick = () => {
      previousTimeInMilliseconds = currentTimeInMilliseconds;
      currentTimeInMilliseconds = performance.now();

      // time elapsed since the timer was started
      const timeElapsedInMilliseconds: number = currentTimeInMilliseconds - startTimeInMilliseconds;

        const message: StopwatchWebWorkerResponseMessageData = { timeElapsedInMilliseconds, isError: false, error: undefined };
        self.postMessage(message);
        self.setTimeout(tick, isFirstTick ? this._pollingIntervalInMilliseconds : getDriftAdjustedInterval(this._pollingIntervalInMilliseconds!, previousTimeInMilliseconds, currentTimeInMilliseconds));

      isFirstTick = false;
    };

    tick();
  }

  private assert(data: StopwatchWebWorkerRequestMessageData) {
    if (typeof data.timeAlreadyElapsedInMilliseconds !== "number") this.postError(new TypeError());
    if (!data.pollingIntervalInMilliseconds) this.postError(new ReferenceError());
    if (typeof data.pollingIntervalInMilliseconds !== "number") this.postError(new TypeError());
    if (data.timeAlreadyElapsedInMilliseconds < 0 || data.timeAlreadyElapsedInMilliseconds > Number.MAX_SAFE_INTEGER) this.postError(new RangeError());
    if (data.pollingIntervalInMilliseconds <= 0 || data.pollingIntervalInMilliseconds > Number.MAX_SAFE_INTEGER) this.postError(new RangeError());
  }

  private postError(error: Error) {
    // post errors back to the main thread as
    // testing framework considers exceptions
    // sent back via 'onerror' as unhandled
    const message: StopwatchWebWorkerResponseMessageData = { timeElapsedInMilliseconds: undefined, isError: true, error: error };
    self.postMessage(message);
    self.close();
  }
}

new StopwatchWebWorker();
