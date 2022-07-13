const { executeCmdHandler } = require("../src/handlers");
const { calculatePosition } = require("../src/reducer");
const { timed } = require("../src/time");

const MAX_STEPS = 100000;

const getRandomDirection = () => {
  const directions = ["north", "south", "west", "east"];
  const idx = Math.floor(Math.random() * 4);
  return directions[idx];
};

const getRandomInt = (max) => Math.floor(Math.random() * max);

// We're not checking that the command doesn't cause the
// robot to go out-of-bounds. We're just benchmarking here.
// (has not been checked for correctness)
const generateTestCommands = (maxSteps, nCommands) => {
  return Array(nCommands)
    .fill(0)
    .map(() => ({
      direction: getRandomDirection(),
      steps: getRandomInt(maxSteps),
    }));
};

const executionStoreMock = {
  get: () => {},
  put: () => {},
};
const res = { json: () => {} };
const start = { x: 0, y: 0 };

const handler = executeCmdHandler(executionStoreMock);
const nCommands = [
  1, 50, 100, 500, 510, 600, 700, 800, 900, 1000, 5000, 6000, 7000, 8000, 9000,
  10000, 15000, 20000,
];

// For comparison, a naive solution that maintains a hash
// map of every visited node.
const naiveSolution = (start, commands) => {
  const state = {
    position: start,
    visitedLocations: {
      [locationKey(start)]: true,
    },
  };

  commands.forEach((cmd) => {
    const newPosition = calculatePosition(state.position, cmd);
    const segment =
      state.position.x < newPosition.x || state.position.y < newPosition.y
        ? [state.position, newPosition]
        : [newPosition, state.position];

    // vertical
    const [start, end] = segment;
    if (start.x === end.x) {
      for (let i = start.y; i <= end.y; i++) {
        state.visitedLocations[locationKey({ x: start.x, y: i })] = true;
      }
    } else {
      for (let i = start.x; i <= end.x; i++) {
        state.visitedLocations[locationKey({ x: i, y: start.y })] = true;
      }
    }

    state.position = end;
  });

  return Object.keys(state.visitedLocations).length;
};

const locationKey = (position) => `${position.x}X${position.y}Y`;

nCommands.forEach((nCmd) => {
  const commands = generateTestCommands(MAX_STEPS, nCmd);
  const req = {
    body: {
      start,
      commands,
    },
  };

  const [duration] = timed(async () => {
    // Run either the real implementation or the naive
    // solution
    await handler(req, res);
    //naiveSolution(start, commands);
  });

  console.log("COMMANDS:", nCmd, "\t\tDURATION (s):", duration);
});
