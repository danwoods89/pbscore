class GameClockWebWorker {
  constructor() {
    self.onmessage = this.onMessage.bind(this);
  }

  public onMessage(event: MessageEvent) {
    const gameTimeInSeconds = event.data;
    this.startGameClock(gameTimeInSeconds);
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
