const storeRecordQuery = `
  INSERT INTO executions(timestamp, commands, result, duration) 
  VALUES (CURRENT_TIMESTAMP, $1, $2, $3)
  RETURNING *;
`;

const createExecutionStore = (db) => {
  return {
    put: async (commands, result, duration) => {
      const queryResult = await db.query(storeRecordQuery, [
        commands,
        result,
        duration,
      ]);
      return queryResult.rows[0];
    },
  };
};

module.exports = { createExecutionStore };
