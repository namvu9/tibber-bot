const { applyCommands } = require("./reducer");
const { createExecutionRecord } = require("./db");
const { timed } = require("./time");
const { countUniqueNodes } = require("./segment");

const executeCmdHandler = (executionStore) => async (req, res) => {
  const { start, commands } = req.body;

  const [duration, result] = timed(executeCommands(start, commands));

  const executionRecord = createExecutionRecord(
    commands.length,
    result,
    duration
  );

  const recordId = await executionStore.put(executionRecord);
  const record = await executionStore.get(recordId);

  res.json(record);
};

const executeCommands = (start, commands) => () => {
  const finalState = applyCommands(start, commands);
  return countUniqueNodes(finalState);
};

module.exports = { executeCmdHandler };
