const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const searchRoutes = require("./routes/search.routes");
const askRoutes = require("./routes/ask.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", askRoutes);

app.get("/", (req, res) => {
  res.send("AI Knowledge Base API running");
});

module.exports = app;