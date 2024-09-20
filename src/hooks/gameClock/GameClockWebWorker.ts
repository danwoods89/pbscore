import getDriftAdjustedInterval from "./GameClockWebWorkerDriftHelper";

const DELAY_IN_MILLISECONDS: number = 100;

export interface IGameClockWebWorker {
  onMessage(event: MessageEvent): void;
}

export class GameClockWebWorker implements IGameClockWebWorker {
  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  public onMessage(event: MessageEvent) {
    const gameTimeInMilliseconds = event.data as number;
    if (!gameTimeInMilliseconds || gameTimeInMilliseconds <= 0) throw new Error("invalid gameTimeInMilliseconds");
    this.startGameClock(gameTimeInMilliseconds!, DELAY_IN_MILLISECONDS);
  }

  private startGameClock(gameTimeInMilliseconds: number, delayInMilliseconds: number): void {
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
