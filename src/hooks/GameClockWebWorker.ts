import getDriftAdjustedInterval from "./GameClockWebWorkerDriftHelper";

export interface IGameClockWebWorker {
  onMessage(event: MessageEvent): void;
}

class GameClockWebWorker implements IGameClockWebWorker {
  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  public onMessage(event: MessageEvent) {
    const gameTimeInMilliseconds = event.data as number;
    if (!gameTimeInMilliseconds || gameTimeInMilliseconds <= 0) throw new Error("invalid gameTimeInMilliseconds");
    this.startGameClock(gameTimeInMilliseconds!);
  }

  private startGameClock(gameTimeInMilliseconds: number): void {
    const startTimeInMilliseconds: number = performance.now();
    // updated each tick
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

      if (remainingTimeInMilliseconds > 0) {
        self.postMessage(remainingTimeInMilliseconds);
        timeoutId = setTimeout(tick, getDriftAdjustedInterval(100, previousTimeInMilliseconds, currentTimeInMilliseconds));
      } else {
        if (timeoutId) clearTimeout(timeoutId!);
      }
    };

    setTimeout(tick, 100);
  }
}

new GameClockWebWorker();
