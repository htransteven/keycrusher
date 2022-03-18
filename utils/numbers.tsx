export const toFixed = (value: number, decimalPlaces: number): number => {
  if (decimalPlaces < 0) throw new Error("decimal place must be > 0");
  return (
    Math.round((value + Number.EPSILON) * Math.pow(10, decimalPlaces)) /
    Math.pow(10, decimalPlaces)
  );
};
