const getDriftAdjustedInterval = (intervalTimeInMilliseconds: number, previousTimeInMillseconds: number, currentTimeInMilliseconds: number): number => {
  const actualIntervalInMilliseconds = currentTimeInMilliseconds - previousTimeInMillseconds;
  const differenceInMilliseconds = intervalTimeInMilliseconds - actualIntervalInMilliseconds;
  return intervalTimeInMilliseconds + differenceInMilliseconds;
};

export default getDriftAdjustedInterval;
