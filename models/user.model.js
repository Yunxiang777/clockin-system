// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  employeeId: String,
  deviceHash: String,
});

export default mongoose.model("User", userSchema);
