const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const { createExecutionStore } = require("./src/db");
const { executeCmdHandler } = require("./src/handlers");

const PORT = 5000;

const main = async () => {
  // Deps
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

  const pgClient = new Client({
    host: "postgres",
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  });

  await pgClient.connect();
  const executionStore = createExecutionStore(pgClient);

  const app = express();

  // Middleware here
  app.use(bodyParser.json());

  // Endpoints
  app.post(
    "/tibber-developer-test/enter-path",
    executeCmdHandler(executionStore)
  );

  app.listen(PORT, () => {
    console.log(`Service listening on port ${PORT}`);
  });
};

main();
