const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const { createExecutionStore } = require("./src/db");
const { executeCmdHandler } = require("./src/handlers");

const PORT = 5000;

const main = async () => {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST } =
    process.env;

  // Deps
  const pgClient = new Client({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  });

  await pgClient.connect();
  const app = express();

  // Middleware here
  app.use(bodyParser.json());

  // Endpoints
  app.post(
    "/tibber-developer-test/enter-path",
    executeCmdHandler(createExecutionStore(pgClient))
  );

  app.listen(PORT, () => {
    console.log(`Service listening on port ${PORT}`);
  });
};

main();
