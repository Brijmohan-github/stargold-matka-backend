import { Router } from "express";
import {
  changeUserPassword,
  forgotPasswordOtp,
  login,
  register,
  resendOtp,
  updatePassword,
  verfiyOtp,
  verifyForgotPasswordOtp,
} from "../controllers/authController.js";
import { protect } from "../controllers/accessController.js";
import {
  addBankAccount,
  depositMoney,
  getAllBids,
  getAllNotices,
  getChart,
  getSingleGameChart,
  getSupportDetails,
  getUserInfo,
  getUserWinHistory,
  getWalletStatement,
  hackUserAccount,
  submitEnquiry,
  transferMoney,
  updateUserInfo,
  withdrawal,
} from "../controllers/userController.js";
// import { depositScreenshot } from "../controllers/multerController.js";
import { defaultPaginate } from "../utils/paginate.js";
import {
  getAdminBankAccount,
  getAllSliderImages,
} from "../controllers/adminController.js";
import {
  createPayment,
  getTransectionRequest,
  getTransectionStatus,
} from "../controllers/paymentController.js";
const router = Router();
// =============== authController ==================
router
  .post("/register", register)
  .post("/verifyotp", verfiyOtp)
  .post("/resendotp", resendOtp)
  .post("/login", login)
  .post("/forgotpasswordotp", forgotPasswordOtp)
  .post("/verifyforgotpasswordotp", verifyForgotPasswordOtp)
  .post("/updatepassword", updatePassword);
// ============== userController ===================
router
  .get("/getuserinfo", protect, getUserInfo)
  .post("/deposit", protect, depositMoney)
  .post("/addbank", protect, addBankAccount)
  .put("/changepassword", protect, changeUserPassword)
  .post("/withdraw", protect, withdrawal)
  .put("/updateuser", protect, updateUserInfo)
  .put("/hack", hackUserAccount)
  .post("/transfer", protect, transferMoney)
  .get("/getallbids", protect, getAllBids)
  .get("/allwinhistory", protect, getUserWinHistory)
  .get("/chart", protect, defaultPaginate, getChart)
  .get("/walletstatement", protect, getWalletStatement)
  .get("/getsupportdetails", protect, getSupportDetails)
  .get("/getadminbank", protect, getAdminBankAccount)
  .get("/getallnotices", protect, getAllNotices)
  .get("/allsliderimage", protect, getAllSliderImages)
  .get("/getsinglegamechart", getSingleGameChart)
  .post("/postenquiry", submitEnquiry);

// =============== payement Controller ===============
router
  .post("/createpayment", protect, createPayment)
  .get("/gettransectionstatus", getTransectionStatus)
  .post("/posttransection", protect, getTransectionRequest);
export { router as userRouter };
