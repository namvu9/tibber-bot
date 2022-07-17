const { applyCommands } = require("./reducer");
const { timed } = require("./time");
const { countUniqueNodes } = require("./segment");

const executeCmdHandler = (executionStore) => async (req, res) => {
  const { start, commands } = req.body;

  const [duration, result] = timed(executeCommands(start, commands));

  const recordId = await executionStore.put(commands.length, result, duration);
  const record = await executionStore.get(recordId);

  res.json(record);
};

// The algorithm can roughly be outlined as follows:
//
// 1. As we iterate over the commands, we build a map of
// contiguous horizontal and vertical segments, representing
// the robot's movements.
//
// 2. Count the number of nodes covered by the horizontal
// and vertical segments, respectively. The sum of these two
// counts will be an overestimate of the number of nodes
// covered since they do not account for overlaps.
//
// 3. Determine the number of nodes covered by both
// horizontal and vertical segments and subtract 1 for each
// such node. The remaining count is the number of UNIQUE
// nodes visited
const executeCommands = (start, commands) => () => {
  const finalState = applyCommands(start, commands);
  return countUniqueNodes(finalState);
};

module.exports = { executeCmdHandler };
