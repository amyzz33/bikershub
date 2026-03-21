const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", upload.single("file"), uploadController.uploadFile);
// ✅ NEW (multiple upload)
router.post(
  "/multiple",
  upload.array("media", 5),
  uploadController.uploadMultipleFiles
);

router.post(
  "/profile",
  authMiddleware,
  upload.single("file"),
  uploadController.uploadProfilePic
);

router.delete("/", uploadController.deleteFile);

module.exports = router;