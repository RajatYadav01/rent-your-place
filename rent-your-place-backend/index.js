const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const databaseSetup = require("./services/database-setup");

dotenv.config({ path: [".env.example", ".env"] });

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

databaseSetup();

app.use("/api/users", require("./routes/user-routes"));

app.use("/api/properties", require("./routes/property-routes"));

const PORT = process.env.PORT || process.env.ALTERNATIVE_PORT;

app.listen(PORT, () => {
    console.log(`Node server is running at port number: ${PORT}`);
});