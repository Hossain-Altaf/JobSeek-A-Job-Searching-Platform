const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Resumes are PDFs/docs -> raw. Images -> image.
    const isImage = file.mimetype.startsWith("image/");
    return {
      folder: "job-portal",
      resource_type: isImage ? "image" : "raw",
      allowed_formats: isImage
        ? ["jpg", "jpeg", "png"]
        : ["pdf", "doc", "docx"],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;