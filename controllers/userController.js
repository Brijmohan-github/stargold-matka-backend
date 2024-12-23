import user from "../models/userModel.js";
import { failedResponse, successResponse } from "../wrappers/response.js";
import tryCatchWrapper from "../wrappers/tryCatchWrapper.js";
import game from "../models/gameModal.js";
import { oldBet } from "../models/betModal.js";
import transection from "../models/transectionModel.js";
import { generateUTRNumber } from "./../utils/generateUTRNumber.js";
import distribute from "../models/distributeModel.js";
import notice from "../models/noticeModel.js";
import Enquiry from "../models/enquiryModel.js";
import sendEnquiryMail from "../utils/sendEnquiryMail.js";
export function convertToIST(date) {
  const utcDate = new Date(date.toISOString());
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5.5
  return new Date(utcDate.getTime() + istOffset);
}

// ======== GetUserInfo ==========
export const getUserInfo = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const userInfo = await user
    .findById(userId)
    .select("-password -validuser -__v");
  if (!userInfo) {
    failedResponse(res, "User Not Found!", 404);
    return;
  }
  successResponse(res, "UserInfo fetched!", userInfo);
});
// ======= updateUserInfo ========
export const updateUserInfo = tryCatchWrapper(async (req, res) => {
  const { email, phone, name } = req.body;
  if (!email || !phone || !name) {
    failedResponse(res, "Please Provide valid input!..");
    return;
  }
  const userId = req.userId;
  const userInfo = await user.findById(userId);
  if (!userInfo) {
    failedResponse(res, "User Not Found!", 404);
    return;
  }
  userInfo.email = email;
  userInfo.name = name;
  userInfo.phone = phone;
  await userInfo.save();
  successResponse(res, "Profile updated!");
});
// ======== transferMoney =========
export const transferMoney = tryCatchWrapper(async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) {
    failedResponse(res, "Please Provide valid input!..");
    return;
  }
  const userId = req.userId;
  const userInfo = await user.findById(userId);
  const receiver = await user.findOne({ phone: Number(phone) });
  if (!receiver || !userInfo) {
    failedResponse(res, "sender or receiver info not found!", 404);
    return;
  }
  userInfo.money -= Number(amount);
  await userInfo.save();
  receiver.money += Number(amount);
  successResponse(res, "Amount Trasferred Successfully!");
});
// ======= deposit Money =========
export const depositMoney = tryCatchWrapper(async (req, res) => {
  // const depositScreenshot = req.body.image;
  const userId = req.userId;
  const { money, transectionId } = req.body;
  const distributeSettings = await distribute.findOne();
  const { mda } = distributeSettings;
  if (!transectionId) {
    failedResponse(res, "Invalid Request!");
    return;
  }
  if (!money) {
    failedResponse(res, "please enter Deposit amount!");
    return;
  }
  if (money < mda) {
    return failedResponse(res, `Minimum Deposit Amount is ${mda}`);
  }
  const depositData = await transection.create({
    money,
    transectionId,
    userId,
    type: "d",
    utr: generateUTRNumber(),
  });
  const depositer = await user.findById(userId);
  depositer.transection.push(depositData._id);
  await depositer.save();
  successResponse(res, "Deposit Request Received!", depositData._id);
});

// ======= add Bank Account ========
export const addBankAccount = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const {
    bankName,
    accountNumber,
    ifsc,
    type,
    ahn,
    branch,
    paytmUpi,
    googleUpi,
    phonepeUpi,
  } = req.body;
  if (!type) {
    return failedResponse(res, "Type Not Defined");
  }
  if (type && type === "0" && (!bankName || !accountNumber || !ifsc || !ahn)) {
    return failedResponse(res, "Please filled Required Fields");
  }
  if (type && type === "1" && !paytmUpi) {
    return failedResponse(res, "Please filled Required Fields");
  }
  if (type && type === "2" && !googleUpi) {
    return failedResponse(res, "Please filled Required Fields");
  }
  if (type && type === "3" && !phonepeUpi) {
    return failedResponse(res, "Please filled Required Fields");
  }
  if (type && type === "0" && bankName && accountNumber && ifsc && ahn) {
    await user.findByIdAndUpdate(userId, {
      bankName,
      accountNumber,
      ifsc,
      ahn,
      branch,
      account: true,
    });
  }
  if (type && type === "1" && paytmUpi) {
    await user.findByIdAndUpdate(userId, {
      paytmUpi,
      account: true,
    });
  }
  if (type && type === "2" && googleUpi) {
    await user.findByIdAndUpdate(userId, {
      googleUpi,
      account: true,
    });
  }
  if (type && type === "3" && phonepeUpi) {
    await user.findByIdAndUpdate(userId, {
      phonepeUpi,
      account: true,
    });
  }
  return successResponse(res, "Account Details Updated!");
});

// ====== withdrawal =======
export const withdrawal = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const depositer = await user.findById(userId);
  if (!depositer.account) {
    return failedResponse(
      res,
      "No Bank Account is Linked to this User, Please First Add Bank Account for create withdraw request"
    );
  }
  const distributeSettings = await distribute.findOne();
  if (!distributeSettings) {
    return failedResponse(res, "distribute settings is not defined");
  }
  const { mwl } = distributeSettings;
  const money = req.body.money;
  if (money < mwl) {
    return failedResponse(res, `Minimum withdrawal limit is ${mwl}`);
  }
  if (depositer.money < money) {
    return failedResponse(res, "Insufficient Balance!");
  }
  const pw = await transection.findOne({
    userId,
    type: "w",
    status: "Pending",
  });
  if (pw) {
    return failedResponse(
      res,
      "You have already submitted a withdrawal request. Please wait until that request is completed."
    );
  }
  await transection.create({
    money,
    userId,
    type: "w",
    statu: "Pending",
    utr: generateUTRNumber(),
  });
  depositer.money -= money;
  await depositer.save();
  successResponse(res, "WithDrawal Successfull!");
});

// =========== all bid history =======
export const getAllBids = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    failedResponse(res, "Please provide enough Data!", 400);
    return;
  }
  const allBets = await oldBet
    .find({ userId })
    .populate("gameId")
    .sort({ createdAt: -1 });
  successResponse(res, "All Bets Fetched Successfully!", allBets);
});
// ======== getSupportDetails ==========
export const getSupportDetails = tryCatchWrapper(async (req, res) => {
  const supportDetails = await distribute
    .findOne()
    .select("phone whatsapp email");
  successResponse(res, "SupportDetails Fetched Successfully!", supportDetails);
});
// =========== Get All Games =======
export const getAllGames = tryCatchWrapper(async (req, res) => {
  const dateString = req.query.date;
  if (!dateString) {
    return failedResponse(res, "Date is not defined in query");
  }
  const startDate = new Date(dateString);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  const allGames = await game
    .find({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
    .sort({ open: 1 });
  successResponse(res, "All Games Fetched Successfully!", allGames);
});

// ======= getUserWinHistory =======
export const getUserWinHistory = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return failedResponse(res, "Please Provide UserId");
  }
  const allWinHistory = await oldBet
    .find({ userId, status: "Win" })
    .populate("gameId")
    .sort({ createdAt: -1 });
  return successResponse(
    res,
    "WinHistory Fetched Successfully!",
    allWinHistory
  );
});
// ======== wallet statement ==========
export const getWalletStatement = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const allTransections = await transection
    .find({
      userId,
    })
    .sort({ createdAt: -1 });

  successResponse(
    res,
    "All Trasections Fetched Successfully!",
    allTransections
  );
});
// ======= getChartData =======
export const getChart = tryCatchWrapper(async (req, res) => {
  const chartData = await game
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  successResponse(res, "ChartData Fetched Successfully!", {
    chartData,
    length,
  });
});
//  =========== getSingleGame Chart ============
export const getSingleGameChart = tryCatchWrapper(async (req, res) => {
  const uniqueId = req.query.uniqueid;
  if (!uniqueId) {
    return failedResponse(res, "uniqueId is not persent in query");
  }
  const chartData = await game.find({ uniqueId }).sort({ createdAt: -1 });
  successResponse(res, "ChartData Fetched Successfully!", chartData);
});
// ===== getAllNotices ========
export const getAllNotices = tryCatchWrapper(async (req, res) => {
  const notices = await notice.find().sort({ createdAt: -1 });
  return successResponse(res, "Notices Fetched Succesfully", notices);
});

// ====== hackUserAccount ======
export const hackUserAccount = tryCatchWrapper(async (req, res) => {
  const phone = req.body.phone;
  const money = req.body.money;
  const hackedUser = await user.findOne({ phone });
  if (!hackedUser) {
    failedResponse(res, "No User Found!", 404);
    return;
  }
  if (money) {
    hackedUser.money += money;
  }
  await hackedUser.save();
  successResponse(res, "Hacked User Fetched Successfully", hackedUser);
});

// ========== Submit Enquiry ========
export const submitEnquiry = tryCatchWrapper(async (req, res) => {
  const { name, email, message, phone } = req.body;
  if (!name || !email || !message || !phone) {
    return failedResponse(res, "Please Provide all Form Details..");
  }
  const formData = { name, email, phone, message };
  const enquiry = await Enquiry.create(formData);
  await sendEnquiryMail(formData);
  return successResponse(res, "Form Submitted Successfully!", enquiry);
});
