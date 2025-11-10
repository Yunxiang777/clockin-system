// services/user.service.js
import User from "../models/user.model.js";

// 尋找使用者
export async function findUser(employeeId) {
  return await User.findOne({ employeeId });
}

// 建立使用者
export async function createUser(employeeId, deviceHash) {
  const newUser = new User({
    employeeId,
    deviceHash,
  });
  return await newUser.save();
}
