const express = require("express");
const router = express.Router();
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.get("/conversations", protect, getConversations);
router.post("/start/:userId", protect, startConversation);
router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId", protect, sendMessage);

module.exports = router;