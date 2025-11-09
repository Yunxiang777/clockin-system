// services/user.service.js
import User from "../models/user.model.js";

export async function findUser(employeeId) {
  return await User.findOne({ employeeId });
}

export async function createUser(employeeId, deviceHash, userAgent, lat, lng) {
  const newUser = new User({
    employeeId,
    deviceHash,
    userAgent,
    gpsLocation: { lat, lng },
  });
  return await newUser.save();
}
