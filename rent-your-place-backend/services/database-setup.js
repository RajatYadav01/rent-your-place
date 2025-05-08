const fs = require("fs");
const { join } = require("path");
const pool = require("../services/database-connection");

const runSQLFile = async (filePath) => {
  const client = await pool.connect();

  try {
    const sql = fs.readFileSync(filePath, "utf8");

    await client.query(sql);

    console.log("SQL file executed successfully to setup database.");
  } catch (error) {
    console.error("Error executing SQL file to setup database", error);
  } finally {
    await client.end();
  }
};

const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT to_regclass('public.users');");
    if (result.rows[0].to_regclass) {
      console.log("Database setup already done. Skipping database setup.");
      return;
    } else {
      await runSQLFile(join(__dirname, "..", "database.example.sql"));
    }
  } catch (error) {
    console.error("Error checking database setup", error);
  } finally {
    await client.end();
  }
};

module.exports = setupDatabase;
