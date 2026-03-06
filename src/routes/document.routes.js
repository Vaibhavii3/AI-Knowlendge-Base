const express = require("express");
const router = express.Router();

const documentController = require("../controllers/document.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  documentController.uploadDocument
);

router.get(
  "/demo-pdf",
  documentController.downloadDemoPdf
);

router.post(
  "/demo-ingest",
  authMiddleware,
  documentController.ingestDemoPdf
);

router.get(
  "/chunks",
  authMiddleware,
  documentController.listChunks
);

router.get(
  "/search",
  authMiddleware,
  documentController.searchDocuments
);

router.post(
  "/ask",
  authMiddleware,
  documentController.askQuestion
);

router.post(
  "/vector-search",
  authMiddleware,
  documentController.vectorSearch
);

router.post(
  "/search-chunks",
  authMiddleware,
  documentController.searchChunks
);

module.exports = router;