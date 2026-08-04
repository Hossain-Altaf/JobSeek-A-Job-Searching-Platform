const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["follow", "like", "comment", "message", "application", "status_update"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // optional links so the frontend can navigate to the right place
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);