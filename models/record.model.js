import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  employeeId: String,
  time: Date,
  ip: String,
  location: { lat: Number, lng: Number },
});

export const Record = mongoose.model("Record", recordSchema);
