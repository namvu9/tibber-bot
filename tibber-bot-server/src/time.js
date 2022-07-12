const { performance } = require("perf_hooks");

const SECOND = 1000;

const timed = (fn) => {
  const startTime = performance.now();
  const res = fn();
  const endTime = performance.now();
  const duration = (endTime - startTime) / SECOND;

  return [duration, res];
};

module.exports = { timed };
