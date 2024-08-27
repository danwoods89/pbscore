import "./App.css";
import useGameClock from "./hooks/useGameClockHook";
import formatTime from "./utils/formatTime";

const App: React.FC = () => {
  const timeLeft = useGameClock(300);

  return (
    <div>
      <h1>Time Left: {formatTime(timeLeft)}</h1>
    </div>
  );
};

export default App;
