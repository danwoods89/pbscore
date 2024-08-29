export interface IGameClockWebWorker {
  onMessage(event: MessageEvent): void;
}

export interface GameClockMessage {
  action: GameClockAction;
  gameTimeInSeconds?: number;
}

export enum GameClockAction {
  Start,
  Stop,
  Reset,
}

class GameClockWebWorker implements IGameClockWebWorker {
  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  public onMessage(event: MessageEvent) {
    const { action, gameTimeInSeconds } = event.data as GameClockMessage;

    switch (action) {
      case GameClockAction.Start: {
        if (!gameTimeInSeconds)
          throw Error("gameTimeInSeconds must be provided.");
        this.startGameClock(gameTimeInSeconds!);
        break;
      }
      case GameClockAction.Stop: {
        this.startGameClock(gameTimeInSeconds!);
        break;
      }
    }
  }

  private startGameClock(gameTimeInSeconds: number): void {
    const gameTimeInMilliseconds = gameTimeInSeconds * 1000;

    const startTimeInMilliseconds: number = performance.now();

    const timer = setInterval(() => {
      const currentTimeInMilliseconds: number = performance.now();

      const timeElapsedInMilliseconds: number =
        currentTimeInMilliseconds - startTimeInMilliseconds;

      const remainingTimeInMilliseconds: number =
        gameTimeInMilliseconds - timeElapsedInMilliseconds;

      if (remainingTimeInMilliseconds <= 0) {
        clearInterval(timer);
      } else {
        self.postMessage(remainingTimeInMilliseconds); // Send result back to the main thread
      }
    }, 100);
  }
}

new GameClockWebWorker();
