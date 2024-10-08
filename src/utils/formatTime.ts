const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const remainingMilliseconds = Math.floor((milliseconds % 1000) / 10); // round to 2 digits

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(remainingMilliseconds).padStart(2, "0")}`;
};

export default formatTime;
