// Run this once with: node seedAdmin.js
// Then delete this file (or keep it privately, never commit it to a public repo).
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("An admin already exists:", existingAdmin.email);
      process.exit();
    }

    const admin = await User.create({
      name: "Site Admin",
      email: "admin@jobportal.com", // change this
      password: "ChangeThisPassword123", // change this
      role: "admin",
    });

    console.log("Admin created:", admin.email);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();