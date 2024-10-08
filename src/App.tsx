import "./App.css";
import useStopwatch from "./hooks/stopwatch/useStopwatchHook";
import formatTime from "./utils/formatTime";

const App: React.FC = () => {
  const gameClock = useStopwatch(1);

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
      <h1>Time Left: {formatTime(gameClock.timeElapsedInMilliseconds)}</h1>
      <button onClick={handleStartClick}>Start</button>
      <button onClick={handleStopClick}>Stop</button>
      <button onClick={handleResetClick}>Reset</button>
    </div>
  );
};

export default App;
