const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const databaseSetup = require("./services/database-setup");

dotenv.config({ path: [".env.production", ".env.example", ".env"] });

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_HOST_URL],
    credentials: true
}));
app.use(express.json());
app.use("/api/users", require("./routes/user-routes"));
app.use("/api/properties", require("./routes/property-routes"));

databaseSetup();

const PORT = process.env.PORT || process.env.ALTERNATIVE_PORT;

app.listen(PORT, () => {
    console.log(`Node server is running at port number: ${PORT}`);
});