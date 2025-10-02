// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: true },
    university: { type: String },
    address: { type: String },

    //  store a PUBLIC path to the uploaded avatar so the client can load it.
    // The upload route writes files to /uploads/avatars, which is served statically.
    
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

// Hash password only when it's created/changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Optional helper if you want to compare passwords elsewhere
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
