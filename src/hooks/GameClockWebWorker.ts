import getDriftAdjustedInterval from "./GameClockWebWorkerDriftHelper";

export interface IGameClockWebWorker {
  onMessage(event: MessageEvent): void;
}

class GameClockWebWorker implements IGameClockWebWorker {
  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  public onMessage(event: MessageEvent) {
    const gameTimeInSeconds = event.data as number;
    this.startGameClock(gameTimeInSeconds!);
  }

  private startGameClock(gameTimeInSeconds: number): void {
    const gameTimeInMilliseconds = gameTimeInSeconds * 1000;
    const startTimeInMilliseconds: number = performance.now();
    // updated each tick
    let currentTimeInMilliseconds: number = startTimeInMilliseconds;
    let previousTimeInMilliseconds: number = startTimeInMilliseconds;

    const tick = () => {
      previousTimeInMilliseconds = currentTimeInMilliseconds;
      console.log(`Previous ${previousTimeInMilliseconds}`);
      currentTimeInMilliseconds = performance.now();
      console.log(`Current ${currentTimeInMilliseconds}`);

      // time elapsed since the timer was started
      const timeElapsedInMilliseconds: number =
        currentTimeInMilliseconds - startTimeInMilliseconds;

      // remaining time is the total game time minus the time elapsed
      const remainingTimeInMilliseconds: number =
        gameTimeInMilliseconds - timeElapsedInMilliseconds;

      if (remainingTimeInMilliseconds > 0) {
        self.postMessage(remainingTimeInMilliseconds);
        setTimeout(
          tick,
          getDriftAdjustedInterval(
            100,
            previousTimeInMilliseconds,
            currentTimeInMilliseconds
          )
        );
      }
    };

    setTimeout(tick, 100);
  }
}

new GameClockWebWorker();
