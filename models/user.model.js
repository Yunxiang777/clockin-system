// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  employeeId: String,
  deviceHash: String,
  userAgent: String,
  gpsLocation: { lat: Number, lng: Number },
});

export default mongoose.model("User", userSchema);
