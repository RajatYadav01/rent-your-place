const { Pool, types } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: [".env.production", ".env.example", ".env"] });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    require: process.env.DB_REQUIRE_SSL === "true",
  },
});

types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

module.exports = pool;
