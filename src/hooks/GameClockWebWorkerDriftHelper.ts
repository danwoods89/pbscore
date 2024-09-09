const getDriftAdjustedInterval = (
  intervalTimeInMilliseconds: number,
  previousTimeInMillseconds: number,
  currentTimeInMilliseconds: number
): number => {
  const actualIntervalInMilliseconds =
    currentTimeInMilliseconds - previousTimeInMillseconds;
  console.log(`actualIntervalInMilliseconds ${actualIntervalInMilliseconds}`);

  const differenceInMilliseconds =
    intervalTimeInMilliseconds - actualIntervalInMilliseconds;
  console.log(`differenceInMilliseconds ${differenceInMilliseconds}`);

  console.log(
    `result  ${intervalTimeInMilliseconds + differenceInMilliseconds}`
  );
  return intervalTimeInMilliseconds + differenceInMilliseconds;
};

export default getDriftAdjustedInterval;
