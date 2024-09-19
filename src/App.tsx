import "./App.css";
import useGameClock from "./hooks/gameClock/useGameClockHook";
import formatTime from "./utils/formatTime";

const App: React.FC = () => {
  const gameClock = useGameClock(300);

  const handleStartClick = () => {
    gameClock.start();
  };

  const handleStopClick = () => {
    gameClock.stop();
  };

  const handleResetClick = () => {
    gameClock.reset();
  };

  return (
    <div>
      <h1>Time Left: {formatTime(gameClock.timeRemainingInMilliseconds)}</h1>
      <button onClick={handleStartClick}>Start</button>
      <button onClick={handleStopClick}>Stop</button>
      <button onClick={handleResetClick}>Reset</button>
    </div>
  );
};

export default App;
