const createExecutionRecord = (commands, result, duration) => ({
  commands,
  result,
  duration,
});

const storeRecordQuery = `
  INSERT INTO executions(timestamp, commands, result, duration) 
  VALUES (CURRENT_TIMESTAMP, $1, $2, $3)
  RETURNING id;
`;

const getRecordQuery = "SELECT * FROM executions WHERE id=$1";

const createExecutionStore = (db) => {
  return {
    put: async (commands, result, duration) => {
      const queryResult = await db.query(storeRecordQuery, [
        commands,
        result,
        duration,
      ]);
      return queryResult.rows[0].id;
    },

    get: async (id) => {
      const result = await db.query(getRecordQuery, [id]);
      return result.rows[0];
    },
  };
};

module.exports = {
  createExecutionRecord,
  createExecutionStore,
};
