import user from "../models/userModel.js";
import tryCatchWrapper from "../wrappers/tryCatchWrapper.js";
import { failedResponse, successResponse } from "../wrappers/response.js";
import { generateAndStoreOTP } from "../utils/otp.js";
import { memoryCache } from "../utils/otp.js";
import { generateToken } from "../utils/generateToken.js";
import distribute from "../models/distributeModel.js";
import transection from "../models/transectionModel.js";
import { generateUTRNumber } from "../utils/generateUTRNumber.js";
import sendOtpViaSMS from "../utils/sendOtpViaSms.js";

// =========== register ============
export const register = tryCatchWrapper(async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return failedResponse(res, "Please fill up required details");
  }
  if (password.length < 4) {
    return failedResponse(res, "Password must be 4 character long");
  }
  const existingUser = await user.find({
    $and: [{ phone: phone }, { validuser: true }],
  });
  if (existingUser.length > 0) {
    return failedResponse(res, "Phone Number Already Exists");
  }

  const checkUser = await user.create({
    name,
    phone,
    password: password,
    validuser: false,
  });
  const otp = await generateAndStoreOTP(checkUser._id);
  await sendOtpViaSMS(phone, otp);
  return successResponse(res, "Otp sent successfully", checkUser._id);
});

// ======== verifyOtp ==========
export const verfiyOtp = tryCatchWrapper(async (req, res) => {
  const userId = req.query.id;
  let checkUser = await user.findById(userId);
  if (!checkUser) {
    return failedResponse(
      res,
      "User Expired, Please fill the registration form again!"
    );
  }
  const cacheKey = "otp_" + userId;
  const userOtp = req.body.otp;
  const savedOtp = await memoryCache.get(cacheKey);
  if (!savedOtp) {
    return failedResponse(res, "Otp Expired!");
  }
  if (userOtp != savedOtp) {
    return failedResponse(res, "Invalid Otp");
  }
  const distributeSettings = await distribute.findOne();
  if (!distributeSettings) {
    return failedResponse(res, "distribute settings are not defined");
  }
  const { nrb } = distributeSettings;
  await transection.create({
    userId: checkUser._id,
    money: nrb,
    utr: generateUTRNumber(),
    type: "b",
    status: "Approved",
  });
  checkUser.money += nrb;
  checkUser.validuser = true;
  await checkUser.save();
  const token = generateToken(checkUser._id);
  return successResponse(res, "Registration Successfull!", token);
});

// ========== resend otp ============
export const resendOtp = tryCatchWrapper(async (req, res) => {
  const userId = req.query.id;
  const checkUser = await user.findById(userId);
  if (!checkUser) {
    return failedResponse(
      res,
      "User Expired, Please fill the registration form again!"
    );
  }
  const otp = await generateAndStoreOTP(userId);
  const phone = checkUser.phone;
  await sendOtpViaSMS(phone, otp);
  successResponse(res, "Otp sent successfully!", userId);
});

// ========== login ==========
export const login = tryCatchWrapper(async (req, res) => {
  const { phone, password } = req.body;
  const checkUser = await user.findOne({
    $and: [{ phone: Number(phone) }, { validuser: true }],
  });
  if (!checkUser) {
    return failedResponse(res, "User Not Found!", 404);
  }
  if (password.length < 4) {
    return failedResponse(res, "Password must be 4 character long");
  }
  const verifyPassword = password === checkUser.password;
  if (!verifyPassword) {
    return failedResponse(res, "Incorrect Password!");
  }
  const token = generateToken(checkUser._id);
  successResponse(res, "login Successfull", token);
});
//  ======= forgotPasswordOtp =======
export const forgotPasswordOtp = tryCatchWrapper(async (req, res) => {
  const phone = req.body.phone;
  if (!phone) {
    return failedResponse(res, "Please Enter Phone Number");
  }
  const checkUser = await user.findOne({
    $and: [{ phone: Number(phone) }, { validuser: true }],
  });
  if (!checkUser) {
    return failedResponse(res, "User Not Found!", 404);
  }
  const otp = await generateAndStoreOTP(checkUser._id);
  await sendOtpViaSMS(phone, otp);
  return successResponse(res, "Otp sent successfully!", checkUser._id);
});
// ======= verifyforgotpasswordOtp ======
export const verifyForgotPasswordOtp = tryCatchWrapper(async (req, res) => {
  const userId = req.query.id;
  const userOtp = req.body.otp;
  const cacheKey = "otp_" + userId;
  const savedOtp = await memoryCache.get(cacheKey);
  if (!savedOtp) {
    return failedResponse(res, "Otp Expired!");
  }
  if (userOtp != savedOtp) {
    return failedResponse(res, "Invalid Otp");
  }
  return successResponse(res, "Otp verified Successfully!", userId);
});

// ======= forgotPassword ======
export const updatePassword = tryCatchWrapper(async (req, res) => {
  const userId = req.query.id;
  const { password, confirmpassword } = req.body;
  if (confirmpassword !== password) {
    return failedResponse(res, "Confirm Password and password are not same");
  }
  if (password.length < 8) {
    return failedResponse(res, "Password must be 8 character long");
  }
  const checkUser = await user.findById(userId);
  if (!checkUser) {
    return failedResponse(res, "User Not Found!", 404);
  }
  await user.findByIdAndUpdate(userId, { password: password });
  successResponse(res, "Password Updated Succesfully!");
});

// ======== changePassword =======
export const changeUserPassword = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const { oldPassword, password, confirmpassword } = req.body;
  if (confirmpassword !== password) {
    return failedResponse(res, "Confirm Password and password are not same");
  }
  if (password.length < 8) {
    return failedResponse(res, "Password must be 8 character long");
  }
  const checkUser = await user.findById(userId);
  if (!checkUser) {
    return failedResponse(res, "User Not Found!", 404);
  }
  const isOldPasswordCorrect = checkUser.password === oldPassword;
  if (!isOldPasswordCorrect) {
    failedResponse(res, "Old Password is Incorrect!");
    return;
  }
  await user.findByIdAndUpdate(userId, { password: password });
  successResponse(res, "Password Updated Succesfully!");
});
