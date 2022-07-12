const {
  createExecutionState,
  countUniqueNodes,
  reduceState,
} = require("./command");
const { createExecutionRecord } = require("./db");
const { performance } = require("perf_hooks");

const SECOND = 1000;

const executeCmdHandler = (executionStore) => async (req, res) => {
  const { start, commands } = req.body;

  const startTime = performance.now();
  const finalState = reduceState(createExecutionState(start), commands);
  const result = countUniqueNodes(finalState);
  const endTime = performance.now();
  const duration = (endTime - startTime) / SECOND;

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
