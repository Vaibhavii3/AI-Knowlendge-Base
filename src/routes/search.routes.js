const express = require("express");
const router = express.Router();

const { searchDocuments } = require("../controllers/searchController");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/search", authMiddleware, searchDocuments);

module.exports = router;