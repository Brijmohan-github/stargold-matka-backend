import tryCatchWrapper from "../wrappers/tryCatchWrapper.js";
import jwt from "jsonwebtoken";
import { failedResponse } from "../wrappers/response.js";
import "dotenv/config";
import user from "../models/userModel.js";

export const protect = tryCatchWrapper(async (req, res, next) => {
  const GetToken = req.headers.authorization;
  if (!GetToken) {
    return failedResponse(res, "token not available in header!");
  }
  const token = GetToken.split(" ")[1];
  if (!token) {
    return failedResponse(res, "User Not Authenticated!");
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRECT_KEY);
  if (!decodedToken) {
    return failedResponse(res, "Unable To decode token");
  }
  const findUser = await user.findById(decodedToken.userId);
  if (!findUser) {
    return failedResponse(res, "User Not Found");
  }
  req.userId = findUser._id;
  next();
});

export const adminProtect = tryCatchWrapper(async (req, res, next) => {
  const GetToken = req.headers.authorization;
  if (!GetToken) {
    return failedResponse(res, "token not available in header!");
  }
  const token = GetToken.split(" ")[1];
  if (!token) {
    return failedResponse(res, "User Not Authenticated!");
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRECT_KEY);
  if (!decodedToken) {
    return failedResponse(res, "Unable To decode token");
  }
  const adminUser = await user.findById(decodedToken.userId);
  if (!adminUser) {
    return failedResponse(res, "Admin Not Found");
  }
  if (!adminUser.isAdmin) {
    return failedResponse(res, "This is not admin account!");
  }
  req.userId = adminUser._id;
  next();
});
