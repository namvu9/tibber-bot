const { applyCommands } = require("./reducer");
const { createExecutionRecord } = require("./db");
const { timed } = require("./time");
const { countUniqueNodes } = require("./result");

const executeCmdHandler = (executionStore) => async (req, res) => {
  const { start, commands } = req.body;

  const [duration, result] = timed(() => {
    const finalState = applyCommands(start, commands);
    return countUniqueNodes(finalState);
  });

  const executionRecord = createExecutionRecord(
    commands.length,
    result,
    duration
  );

  const recordId = await executionStore.put(executionRecord);
  const record = await executionStore.get(recordId);

  res.json(record);
};

module.exports = { executeCmdHandler };
