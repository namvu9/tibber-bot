const DB_TABLE_NAME = "executions";

const createExecutionRecord = (commands, result, duration) => ({
  commands,
  result,
  duration,
});

const storeRecordQuery = (table, { commands, result, duration }) => `
  INSERT INTO ${table}(timestamp, commands, result, duration) 
  VALUES (CURRENT_TIMESTAMP, ${commands}, ${result}, ${duration})
  RETURNING id;
`;

const getRecordQuery = (table, id) => `
  SELECT * FROM ${table} WHERE id=${id};
`;

const createExecutionStore = (db) => {
  return {
    put: async (record) => {
      const result = await db.query(storeRecordQuery(DB_TABLE_NAME, record));
      return result.rows[0].id;
    },

    get: async (id) => {
      const result = await db.query(getRecordQuery(DB_TABLE_NAME, id));
      return result.rows[0];
    },

    getAll: async () => {
      return await db.query(`SELECT * FROM executions;`);
    },
  };
};

module.exports = {
  createExecutionRecord,
  createExecutionStore,
};
