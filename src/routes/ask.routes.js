const express = require("express");
const router = express.Router();

const { askAI } = require("../controllers/askController");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/ask", authMiddleware, askAI);

module.exports = router;