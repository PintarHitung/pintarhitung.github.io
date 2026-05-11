// Floating point safe rounding
export const safeRound = (num, decimals = 2) => {
  if (isNaN(num) || num === null) return 0;
  return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
};

// Calculate average of a semester's subjects
export const calculateSemesterAvg = (subjects) => {
  const validScores = subjects
    .map(s => parseFloat(s.score))
    .filter(v => !isNaN(v) && v > 0);
  if (validScores.length === 0) return 0;
  const sum = validScores.reduce((a, b) => a + b, 0);
  return safeRound(sum / validScores.length, 2);
};

// Mean of an array of numbers
export const mean = (arr) => {
  const valid = arr.filter(v => v > 0);
  if (valid.length === 0) return 0;
  return safeRound(valid.reduce((a, b) => a + b, 0) / valid.length, 2);
};

// Standard deviation
export const stdDev = (arr) => {
  const valid = arr.filter(v => v > 0);
  if (valid.length < 2) return 0;
  const avg = mean(valid);
  const squaredDiffs = valid.map(v => Math.pow(v - avg, 2));
  return safeRound(Math.sqrt(mean(squaredDiffs)), 2);
};

// Linear trend slope (positive = naik, negative = turun)
export const linearTrend = (arr) => {
  const valid = arr.filter(v => v > 0);
  if (valid.length < 2) return 0;
  const n = valid.length;
  const xMean = (n - 1) / 2;
  const yMean = mean(valid);
  let num = 0, den = 0;
  valid.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += Math.pow(x - xMean, 2);
  });
  return den === 0 ? 0 : safeRound(num / den, 3);
};
