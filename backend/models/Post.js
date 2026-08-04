const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["update", "skill", "company_news", "job_share"],
      default: "update",
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Cloudinary URL, optional
      default: "",
    },
    // Optional link to a job, used when type === "job_share"
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);