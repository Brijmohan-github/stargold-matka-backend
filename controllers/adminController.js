import argon2 from "argon2";
import user from "../models/userModel.js";
import { bet, oldBet } from "../models/betModal.js";
import game from "../models/gameModal.js";
import { failedResponse, successResponse } from "../wrappers/response.js";
import tryCatchWrapper from "../wrappers/tryCatchWrapper.js";
import { generateAdminToken } from "../utils/generateToken.js";
import { calculateOnesDigitOfSum } from "../utils/calculateResult.js";
import transection from "../models/transectionModel.js";
import bank from "../models/bankModel.js";
import { generateUTRNumber } from "../utils/generateUTRNumber.js";
import notice from "../models/noticeModel.js";
import distribute from "../models/distributeModel.js";
import slider from "../models/sliderModel.js";
//========== adminRegister ==========
export const adminRegister = tryCatchWrapper(async (req, res) => {
  const { name, password } = req.body;
  const existingUser = await user.findOne({
    isAdmin: true,
  });
  if (existingUser) {
    return failedResponse(res, "Admin already exists.");
  }
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 16,
  });
  const newUser = await user.create({
    name,
    password: hash,
    normalPassword: password,
    referCode: "2KYuafe6",
    isAdmin: true,
    phone: 9999999999,
    email: "admin@gmail.com",
    validuser: true,
    senderCode: password,
  });
  return successResponse(res, "Admin Created Successfully", newUser);
});
// ======= adminLogin =======
export const adminLogin = tryCatchWrapper(async (req, res) => {
  const { name, password } = req.body;
  const CheckUser = await user.findOne({
    $and: [{ name }, { validuser: true }, { isAdmin: true }],
  });
  if (!CheckUser) {
    failedResponse(res, "Admin Not Found!", 404);
    return;
  }
  const hashedPassword = CheckUser.password;
  const verifyPassword = await argon2.verify(hashedPassword, password);
  if (!verifyPassword) {
    failedResponse(res, "Incorrect Password!");
    return;
  }
  const token = generateAdminToken(CheckUser._id);
  successResponse(res, "login Successfull", token);
});

//  ======= admin password Change ======
export const changeAdminPassword = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const { oldPassword, password, confirmPassword } = req.body;
  if (confirmPassword !== password) {
    return failedResponse(res, "Confirm Password and password are not same");
  }
  const CheckUser = await user.findById(userId);
  if (!CheckUser) {
    failedResponse(res, "User Not Found!", 404);
    return;
  }
  const oldAvailableHash = CheckUser.password;
  const isOldPasswordCorrect = await argon2.verify(
    oldAvailableHash,
    oldPassword
  );
  if (!isOldPasswordCorrect) {
    failedResponse(res, "Old Password is Incorrect!");
    return;
  }
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 16,
  });
  await user.findByIdAndUpdate(userId, {
    password: hash,
    normalPassword: password,
  });
  successResponse(res, "Password Updated Succesfully!");
});

// ========= getAllUser =======
export const getAllUser = tryCatchWrapper(async (req, res) => {
  const allUser = await user
    .find({
      isAdmin: false,
      phone: {
        $nin: [
          9696969696, 9191919191, 9292929292, 9393939393, 9494949494,
          9595959595, 9696969696, 9797979797, 9898989898, 9999999999,
          9494940101,
        ],
      },
      validuser: true,
    })
    .sort({ createdAt: -1 });
  successResponse(res, "AllUser Fetched!", { allUser });
});
// ==== updateuserbalance =====
export const updateUserBalance = tryCatchWrapper(async (req, res) => {
  const money = req.body.money;
  const userId = req.query.userid;
  const type = req.body.type;

  const updatedUser = await user.findById(userId);
  if (!updatedUser) {
    return failedResponse(res, "User Not Found", 404);
  }
  if (type === "add") {
    updatedUser.money += parseInt(money, 10);
    await transection.create({
      type: "d",
      utr: generateUTRNumber(),
      status: "Approved",
      userId: updatedUser._id,
      money,
    });
    await updatedUser.save();
    return successResponse(res, "Money Successfully added in user Account");
  } else if (type === "minus") {
    if (money > updatedUser.money) {
      return failedResponse(
        res,
        "User Wallet Balance is less than provided amount"
      );
    }
    updatedUser.money -= parseInt(money, 10);
    await transection.create({
      type: "w",
      utr: generateUTRNumber(),
      status: "Debited",
      userId: updatedUser._id,
      money,
    });
    await updatedUser.save();
    return successResponse(
      res,
      "Money Successfully Substracted From user Wallet"
    );
  }
});
// ========= change userstatus =========
export const changeUserStatus = tryCatchWrapper(async (req, res) => {
  const userId = req.body.id;
  const status = req.body.status;
  if (!userId || !status) {
    return failedResponse(res, "Not Enough Data!");
  }
  const CheckUser = await user.findById(userId);
  if (!CheckUser) {
    failedResponse(res, "User Not Found!", 404);
    return;
  }
  await user.findByIdAndUpdate(userId, { status });
  return successResponse(res, "User Status Changed Successfully!");
});

// ======= getAllDeposit ========
export const getAllDeposit = tryCatchWrapper(async (req, res) => {
  const allDeposit = await transection
    .find({ type: "d", $or: [{ status: "Pending" }, { status: "Approved" }] })
    .populate("userId")
    .sort({ createdAt: -1 })
    .exec();
  successResponse(res, "Data Fetched!", { allDeposit });
});

// ======= getAllWithDraw =======
export const getAllWithDraw = tryCatchWrapper(async (req, res) => {
  const allWithdraw = await transection
    .find({ type: "w" })
    .populate("userId")
    .sort({ createdAt: -1 })
    .exec();
  successResponse(res, "Data Fetched!", { allWithdraw });
});

// ======= acceptDeposit ========
export const acceptDeposit = tryCatchWrapper(async (req, res) => {
  const { userId, money, depositId, status } = req.body;
  if (!userId || !depositId || !status || !money) {
    return failedResponse(res, "Something went Wrong!", 400);
  }
  const depositer = await user.findById(userId);
  const depositData = await transection.findById(depositId);
  if (!depositData) {
    return;
  }
  if (status === "Approved") {
    depositData.status = "Approved";
    depositer.money += money;
    await depositData.save();
    await depositer.save();
    return successResponse(res, "Deposit Accepted!");
  } else {
    depositData.status = "Rejected";
    await depositData.save();
    return successResponse(res, "Deposit Rejected!");
  }
});

// ======= acceptWithdraw ========
export const acceptWithdraw = tryCatchWrapper(async (req, res) => {
  const { userId, money, withdrawId, status } = req.body;
  if (!userId || !withdrawId || !money || !status) {
    return failedResponse(res, "Something went Wrong!", 500);
  }
  const withDrawer = await user.findById(userId);
  const withdrawData = await transection.findById(withdrawId);
  if (status === "Approved") {
    withdrawData.status = "Approved";
    await withdrawData.save();
    await withDrawer.save();
    successResponse(res, "withdraw Accepted!");
  } else if (status === "Rejected") {
    withdrawData.status = "Rejected";
    withDrawer.money += money;
    await withDrawer.save();
    await withdrawData.save();
    failedResponse(res, "withdraw Rejected!");
  } else {
    withdrawData.status = "Rejected";
    await withdrawData.save();
    return failedResponse(res, "User Have Not Enough Balance!");
  }
});

//======= get All Bets ======
export const getAllBets = tryCatchWrapper(async (req, res) => {
  const data = await oldBet
    .find({})
    .populate("gameId userId")
    .sort({ createdAt: -1 });
  successResponse(res, "All Bets Fetched Successfully!", data);
});

//======getAllGameBets=========
export const getAllGameBets = tryCatchWrapper(async (req, res) => {
  const gameId = req.query.gameid;
  // const startOfToday = new Date();
  // startOfToday.setHours(0, 0, 0, 0);
  const nowUTC = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date(nowUTC.getTime() + offset);
  const startOfToday = new Date(nowUTC.setHours(0, 0, 0, 0) + offset);
  const data = await oldBet
    .find({
      gameId: gameId,
      createdAt: { $gte: startOfToday },
    })
    .populate("gameId userId")
    .sort({ createdAt: -1 });
  successResponse(res, "Today's Bets Fetched Successfully!", data);
});
// ============
export const getStatusBets = tryCatchWrapper(async (req, res) => {
  let status = req.query.status;
  const gameId = req.query.gameid;
  if (!status || !gameId) {
    return failedResponse(res, "Status NOt persent in query");
  }
  // const startOfToday = new Date();
  // startOfToday.setHours(0, 0, 0, 0);
  const nowUTC = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date(nowUTC.getTime() + offset);
  const startOfToday = new Date(nowUTC.setHours(0, 0, 0, 0) + offset);
  const data = await oldBet
    .find({
      gameId: gameId,
      status,
      createdAt: { $gte: startOfToday },
    })
    .populate("gameId userId")
    .sort({ createdAt: -1 });
  successResponse(res, "Today's Bets Fetched Successfully!", data);
});
// ======== getalllivegamebets =======
export const getLiveGameData = tryCatchWrapper(async (req, res) => {
  const gameId = req.query.gameid;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  if (!gameId) {
    return failedResponse(res, "GameId Not available");
  }
  const openBets = await bet.find({
    gameId: gameId,
    gameType: "open",
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
  const closeBets = await bet.find({
    gameId: gameId,
    gameType: "close",
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const betType = ["sd", "jd", "sp", "dp", "tp", "hs", "fs"];
  const onPlace = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const oc1 = betType.reduce((acc, type) => ({ ...acc, [type]: 0 }), {});
  const oc2 = onPlace.reduce((acc, place) => ({ ...acc, [place]: 0 }), {});
  const cc1 = betType.reduce((acc, type) => ({ ...acc, [type]: 0 }), {});
  const cc2 = onPlace.reduce((acc, place) => ({ ...acc, [place]: 0 }), {});

  openBets.forEach((bet) => {
    if (betType.includes(bet.betType)) {
      oc1[bet.betType] += bet.betAmount;
    }
    if (onPlace.includes(bet.onPlace)) {
      oc2[bet.onPlace] += bet.betAmount;
    }
  });

  closeBets.forEach((bet) => {
    if (betType.includes(bet.betType)) {
      cc1[bet.betType] += bet.betAmount;
    }
    if (onPlace.includes(bet.onPlace)) {
      cc2[bet.onPlace] += bet.betAmount;
    }
  });

  const data = { open: [oc1, oc2], close: [cc1, cc2] };
  successResponse(res, "Live GameData Fetched Successfully!", data);
});
// ========= getAllGame Data ==========

async function findBets(gameId, gameType, betType, startOfDay, endOfDay) {
  return await bet.find({
    gameId: gameId,
    gameType: gameType,
    betType: betType,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
}
const doublePannas = [
  118, 226, 244, 334, 550, 299, 488, 668, 677, 100, 119, 155, 227, 335, 344,
  399, 588, 669, 110, 200, 228, 255, 336, 660, 499, 688, 778, 300, 166, 229,
  337, 355, 445, 599, 779, 788, 112, 220, 400, 266, 338, 446, 455, 770, 699,
  113, 122, 500, 177, 339, 366, 447, 799, 889, 114, 330, 600, 277, 448, 466,
  556, 880, 899, 115, 133, 223, 700, 188, 377, 449, 557, 566, 116, 224, 233,
  440, 800, 288, 477, 558, 990, 199, 388, 559, 577, 667, 117, 144, 225, 900,
];
const singlePannas = [
  127, 136, 145, 190, 235, 280, 370, 460, 389, 479, 569, 578, 128, 137, 146,
  236, 245, 290, 380, 470, 560, 489, 579, 678, 129, 138, 147, 156, 237, 246,
  345, 390, 480, 570, 589, 679, 120, 139, 148, 157, 238, 247, 256, 346, 490,
  580, 670, 689, 130, 149, 158, 167, 239, 248, 257, 347, 356, 590, 680, 789,
  140, 230, 159, 168, 249, 258, 267, 348, 357, 456, 690, 780, 123, 150, 240,
  169, 178, 259, 268, 349, 358, 367, 457, 790, 124, 160, 250, 340, 179, 269,
  278, 359, 368, 458, 467, 890, 125, 134, 170, 260, 350, 189, 279, 369, 378,
  459, 468, 567, 289, 379, 469, 478, 568, 126, 135, 180, 234, 270, 360, 450,
];
export const getAllOpenGameBetData = tryCatchWrapper(async (req, res) => {
  const gameId = req.query.gameid;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  if (!gameId) {
    return failedResponse(res, "GameId Not available");
  }
  // calculation for sd bets
  const openSdBets = await findBets(gameId, "open", "sd", startOfDay, endOfDay);
  const singleDigit = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const openSdBetsAmountSum = singleDigit.reduce((acc, digit) => {
    acc[digit] = 0;
    return acc;
  }, {});
  openSdBets.forEach((bet) => {
    if (openSdBetsAmountSum.hasOwnProperty(bet.onPlace)) {
      openSdBetsAmountSum[bet.onPlace] += bet.betAmount;
    }
  });
  const jodiBets = await findBets(gameId, "close", "jd", startOfDay, endOfDay);
  const openSpBets = await findBets(gameId, "open", "sp", startOfDay, endOfDay);
  const openDpBets = await findBets(gameId, "open", "dp", startOfDay, endOfDay);
  const closeDpBets = await findBets(
    gameId,
    "close",
    "dp",
    startOfDay,
    endOfDay
  );
  const openTpBets = await findBets(gameId, "open", "tp", startOfDay, endOfDay);
  const hsBets = await findBets(gameId, "close", "hs", startOfDay, endOfDay);
  const fsBets = await findBets(gameId, "close", "fs", startOfDay, endOfDay);
  const data = { open: [oc1, oc2], close: [cc1, cc2] };
  successResponse(res, "Live GameData Fetched Successfully!", data);
});
// ======= lockGame ========
export const lockGame = tryCatchWrapper(async (req, res) => {
  const lock = req.body.lock;
  const gameId = req.body.gameId;
  await game.findByIdAndUpdate(gameId, { lock });
  successResponse(res, `Game Lock Status ${lock}`);
});
//====== changeBetResult =========
export const changeBetResult = tryCatchWrapper(async (req, res) => {
  const { openAnk, closeAnk, onPlace, openNumber, closeNumber, betId } =
    req.body;
  const bet = await oldBet.findById(betId);

  bet.openAnk = openAnk || bet.openAnk;
  bet.closeAnk = closeAnk || bet.closeAnk;
  bet.onPlace = onPlace || bet.onPlace;
  bet.openNumber = openNumber || bet.openNumber;
  bet.closeNumber = closeNumber || bet.closeNumber;
  await bet.save();
  return successResponse(res, "Bet Result Successfully updated");
});

// ========= setGameResult =========
export const setGameResult = tryCatchWrapper(async (req, res) => {
  const { gameType, gameId, result: result1 } = req.body;
  let result = parseInt(result1, 10);
  if (result != 0) {
    if (!gameType || !gameId || !result) {
      return failedResponse(res, "Insufficient InputData");
    }
  }
  let a, b;
  let openResult;
  let closeResult;
  const runningGame = await game.findById(gameId);
  if (!runningGame) {
    return failedResponse(res, "Game Not Found");
  }
  const { sd, jd, sp, dp, tp, hs, fs, ssp, ssd, sdp, stp } =
    await distribute.findOne();
  if (gameType === "open") {
    const openTime = runningGame.open;
    const currentTime = new Date();
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    // if (isUserAbleToPlaceBet) {
    //   return failedResponse(
    //     res,
    //     "Game is Currently open for this option, You Can't Declare Result"
    //   );
    // }
    if (runningGame.openResult !== 5000) {
      return failedResponse(
        res,
        "Open Result Already declared, Please update the result."
      );
    }
    a = calculateOnesDigitOfSum(result);
    runningGame.openResult = result;
    runningGame.openAnk = a;
    let openResult = result;
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Pending",
      gameType: "open",
    });
    await runningGame.save();

    if (all_open_close_bets.length > 0) {
      for (const bet of all_open_close_bets) {
        let status = "Lose";
        const betUser = await user.findById(bet.userId);
        if (bet.betType === "sd" && bet.onPlace == a) {
          betUser.money += bet.betAmount * sd;
          bet.winAmount = bet.betAmount * sd;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * sd,
          });
          status = "Win";
        }
        if (bet.betType === "ssd" && bet.onPlace == a) {
          betUser.money += bet.betAmount * ssd;
          bet.winAmount = bet.betAmount * ssd;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * ssd,
          });
          status = "Win";
        }
        if (bet.betType === "sp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * sp;
          bet.winAmount = bet.betAmount * sp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * sp,
          });
          status = "Win";
        }
        if (bet.betType === "dp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * dp;
          bet.winAmount = bet.betAmount * dp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * dp,
          });
          status = "Win";
        }
        if (bet.betType === "tp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * tp;
          bet.winAmount = bet.betAmount * tp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * tp,
          });
          status = "Win";
        }
        if (bet.betType === "ssp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * ssp;
          bet.winAmount = bet.betAmount * ssp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * ssp,
          });
          status = "Win";
        }
        if (bet.betType === "sdp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * sdp;
          bet.winAmount = bet.betAmount * sdp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * sdp,
          });
          status = "Win";
        }
        if (bet.betType === "stp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * stp;
          bet.winAmount = bet.betAmount * stp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",
            userId: bet.userId,
            money: bet.betAmount * stp,
          });
          status = "Win";
        }
        await betUser.save();
        bet.status = status;
        await bet.save();
      }
    }
  } else if (gameType === "close") {
    const currentTime = new Date();
    const closeTime = runningGame.close;
    const [openHour, openMinute] = closeTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    // if (isUserAbleToPlaceBet) {
    //   return failedResponse(
    //     res,
    //     "Game is Currently open for this option, You Can't Declare Result"
    //   );
    // }
    if (runningGame.openResult === 5000) {
      return failedResponse(
        res,
        "OpenResult Is not decalred, First Declared the Open Result"
      );
    }
    if (runningGame.closeResult !== 5000) {
      return failedResponse(
        res,
        "Close Result Already declared, Please update the result."
      );
    }
    a = calculateOnesDigitOfSum(runningGame.openResult);
    b = calculateOnesDigitOfSum(result);
    runningGame.closeResult = result;
    runningGame.closeAnk = b;
    openResult = runningGame.openResult;
    closeResult = result;
    runningGame.combination = a * 10 + b;
    runningGame.status = "close";
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Pending",
      gameType: "close",
    });
    await runningGame.save();
    for (const bet of all_open_close_bets) {
      let status = "Lose";
      const betUser = await user.findById(bet.userId);
      if (bet.betType === "sd" && bet.onPlace == b) {
        betUser.money += bet.betAmount * sd;
        bet.winAmount = bet.betAmount * sd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",
          userId: bet.userId,
          money: bet.betAmount * sd,
        });
        status = "Win";
      }

      if (bet.betType === "jd" && bet.onPlace === a * 10 + b) {
        betUser.money += bet.betAmount * jd;
        bet.winAmount = bet.betAmount * jd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",
          userId: bet.userId,
          money: bet.betAmount * jd,
        });
        status = "Win";
      }
      if (bet.betType === "sp" && bet.onPlace === closeResult) {
        betUser.money += bet.betAmount * sp;
        bet.winAmount = bet.betAmount * sp;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",
          userId: bet.userId,
          money: bet.betAmount * sp,
        });
        status = "Win";
      }
      if (bet.betType === "dp" && bet.onPlace === closeResult) {
        betUser.money += bet.betAmount * dp;
        bet.winAmount = bet.betAmount * dp;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",
          userId: bet.userId,
          money: bet.betAmount * dp,
        });
        status = "Win";
      }
      if (bet.betType === "tp" && bet.onPlace === closeResult) {
        betUser.money += bet.betAmount * tp;
        bet.winAmount = bet.betAmount * tp;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",
          userId: bet.userId,
          money: bet.betAmount * tp,
        });
        status = "Win";
      }
      if (
        bet.betType === "hs" &&
        bet.openAnk === a &&
        bet.closeNumber === closeResult
      ) {
        betUser.money += bet.betAmount * hs;
        bet.winAmount = bet.betAmount * hs;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",
          userId: bet.userId,
          money: bet.betAmount * hs,
        });
        status = "Win";
      }
      if (
        bet.betType === "hs" &&
        bet.closeAnk === b &&
        bet.openNumber === openResult
      ) {
        betUser.money += bet.betAmount * hs;
        bet.winAmount = bet.betAmount * hs;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * hs,
        });
        status = "Win";
      }
      if (
        bet.betType === "fs" &&
        bet.openNumber === openResult &&
        bet.closeNumber === closeResult
      ) {
        betUser.money += bet.betAmount * fs;
        bet.winAmount = bet.betAmount * fs;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * fs,
        });
        status = "Win";
      }
      await betUser.save();
      bet.status = status;
      await bet.save();
    }
  }
  successResponse(res, "Result Updated Succesfully");
});
// ============= Show Winner ==============
export const showNormalGameWinner = tryCatchWrapper(async (req, res) => {
  const { gameType, gameId, result: result1 } = req.body;
  let result = parseInt(result1, 10);

  if (!gameType || !gameId || !result) {
    return failedResponse(res, "Insufficient InputData");
  }
  let a, b;
  let openResult;
  let closeResult;
  const runningGame = await game.findById(gameId);
  if (!runningGame) {
    return failedResponse(res, "Game Not Found");
  }
  const { sd, jd, sp, dp, tp, hs, fs, ssd, ssp, sdp, stp } =
    await distribute.findOne();
  if (gameType === "open") {
    a = calculateOnesDigitOfSum(result);
    let openResult = result;
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Pending",
      gameType: "open",
    });
    if (all_open_close_bets.length > 0) {
      for (const bet of all_open_close_bets) {
        if (bet.betType === "sd" && bet.onPlace == a) {
          bet.winAmount = bet.betAmount * sd;
        }
        if (bet.betType === "sp" && bet.onPlace == openResult) {
          bet.winAmount = bet.betAmount * sp;
        }
        if (bet.betType === "dp" && bet.onPlace == openResult) {
          bet.winAmount = bet.betAmount * dp;
        }
        if (bet.betType === "tp" && bet.onPlace == openResult) {
          bet.winAmount = bet.betAmount * tp;
        }
        if (bet.betType === "ssd" && bet.onPlace == a) {
          bet.winAmount = bet.betAmount * ssd;
        }
        if (bet.betType === "ssp" && bet.onPlace == openResult) {
          bet.winAmount = bet.betAmount * ssp;
        }
        if (bet.betType === "sdp" && bet.onPlace == openResult) {
          bet.winAmount = bet.betAmount * sdp;
        }
        if (bet.betType === "stp" && bet.onPlace == openResult) {
          bet.winAmount = bet.betAmount * stp;
        }
        bet.status = "Check";
        await bet.save();
      }
    }
  } else if (gameType === "close") {
    a = calculateOnesDigitOfSum(runningGame.openResult);
    b = calculateOnesDigitOfSum(result);
    openResult = runningGame.openResult;
    closeResult = result;
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Pending",
      gameType: "close",
    });
    for (const bet of all_open_close_bets) {
      if (bet.betType === "sd" && bet.onPlace == b) {
        bet.winAmount = bet.betAmount * sd;
      }
      if (bet.betType === "jd" && bet.onPlace === a * 10 + b) {
        bet.winAmount = bet.betAmount * jd;
      }
      if (bet.betType === "sp" && bet.onPlace === closeResult) {
        bet.winAmount = bet.betAmount * sp;
      }
      if (bet.betType === "dp" && bet.onPlace === closeResult) {
        bet.winAmount = bet.betAmount * dp;
      }
      if (bet.betType === "tp" && bet.onPlace === closeResult) {
        bet.winAmount = bet.betAmount * tp;
      }
      if (
        bet.betType === "hs" &&
        bet.openAnk === a &&
        bet.closeNumber === closeResult
      ) {
        bet.winAmount = bet.betAmount * hs;
      }
      if (
        bet.betType === "hs" &&
        bet.closeAnk === b &&
        bet.openNumber === openResult
      ) {
        bet.winAmount = bet.betAmount * hs;
      }
      if (
        bet.betType === "fs" &&
        bet.openNumber === openResult &&
        bet.closeNumber === closeResult
      ) {
        bet.winAmount = bet.betAmount * fs;
      }
      bet.status = "Check";
      await bet.save();
    }
  }
  successResponse(res, "Result Checked Successfully");
});
// ================ resetWinner =================
export const resetWinner = tryCatchWrapper(async (req, res) => {
  const { gameId, gameType } = req.body;
  if (!gameId || !gameType) {
    return failedResponse(res, "Missing gameId or gameType", 400);
  }

  const updateResult = await oldBet.updateMany(
    { gameType, gameId, status: "Check" },
    { $set: { winAmount: 0, status: "Pending" } }
  );
  if (updateResult.matchedCount === 0) {
    return failedResponse(res, "No entries found to reset", 404);
  }
  return successResponse(res, "Reset winner successfully");
});

// ======== updateGameResult =========
export const updateGameResult = tryCatchWrapper(async (req, res) => {
  const { gameType, gameId, result: result1 } = req.body;
  let result = parseInt(result1, 10);
  if (result != 0) {
    if (!gameType || !gameId || !result) {
      return failedResponse(res, "Insufficient InputData");
    }
  }
  let a, b;
  let openResult;
  let closeResult;
  const runningGame = await game.findById(gameId);
  if (!runningGame) {
    return failedResponse(res, "Game Not Found");
  }
  const { sd, jd, sp, dp, tp, hs, fs } = await distribute.findOne();
  if (gameType === "open") {
    a = calculateOnesDigitOfSum(result);
    runningGame.openResult = result;
    let openResult = result;
    runningGame.openAnk = a;
    await runningGame.save();
    const all_open_close_bets_Win = await oldBet.find({
      gameId,
      gameType: "open",
      status: "Win",
    });
    if (all_open_close_bets_Win.length) {
      for (const bet of all_open_close_bets_Win) {
        const betUser = await user.findById(bet.userId);
        betUser.money -= bet.winAmount;
        bet.status = "Lose";
        await bet.save();
        await betUser.save();
        await transection.create({
          type: "w",
          utr: generateUTRNumber(),
          status: "Approved",
          userId: bet.userId,
          money: bet.winAmount,
        });
      }
    }
    const all_open_close_bets = await oldBet.find({
      gameId,
      gameType: "open",
      status: "Lose",
    });
    if (all_open_close_bets.length) {
      for (const bet of all_open_close_bets) {
        let status = "Lose";
        const betUser = await user.findById(bet.userId);
        if (bet.betType === "sd" && bet.onPlace == a) {
          betUser.money += bet.betAmount * sd;
          bet.winAmount = bet.betAmount * sd;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",

            userId: bet.userId,
            money: bet.betAmount * sd,
          });
          status = "Win";
        }
        if (bet.betType === "sp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * sp;
          bet.winAmount = bet.betAmount * sp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",

            userId: bet.userId,
            money: bet.betAmount * sp,
          });
          status = "Win";
        }
        if (bet.betType === "dp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * dp;
          bet.winAmount = bet.betAmount * dp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",

            userId: bet.userId,
            money: bet.betAmount * dp,
          });
          status = "Win";
        }
        if (bet.betType === "tp" && bet.onPlace === openResult) {
          betUser.money += bet.betAmount * tp;
          bet.winAmount = bet.betAmount * tp;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",

            userId: bet.userId,
            money: bet.betAmount * tp,
          });
          status = "Win";
        }
        await betUser.save();
        bet.status = status;
        await bet.save();
      }
    }
  } else if (gameType === "close") {
    if (runningGame.openResult === 5000) {
      return failedResponse(
        res,
        "OpenResult Is not decalred, First Declared the Open Result"
      );
    }
    a = calculateOnesDigitOfSum(runningGame.openResult);
    b = calculateOnesDigitOfSum(result);
    runningGame.closeResult = result;
    runningGame.closeAnk = b;
    openResult = runningGame.openResult;
    closeResult = result;
    runningGame.combination = a * 10 + b;
    runningGame.status = "close";
    await runningGame.save();
    const all_open_close_bets_Win = await oldBet.find({
      gameId,
      gameType: "close",
      status: "Win",
    });
    if (all_open_close_bets_Win.length) {
      for (const bet of all_open_close_bets_Win) {
        const betUser = await user.findById(bet.userId);
        betUser.money -= bet.winAmount;
        bet.status = "Lose";
        await bet.save();
        await betUser.save();
        await transection.create({
          type: "w",
          utr: generateUTRNumber(),
          status: "Approved",
          userId: bet.userId,
          money: bet.winAmount,
        });
      }
    }
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Lose",
      gameType: "close",
    });
    for (const bet of all_open_close_bets) {
      let status = "Lose";
      const betUser = await user.findById(bet.userId);
      if (bet.betType === "sd" && bet.onPlace == b) {
        betUser.money += bet.betAmount * sd;
        bet.winAmount = bet.betAmount * sd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * sd,
        });
        status = "Win";
      }

      if (bet.betType === "jd" && bet.onPlace === a * 10 + b) {
        betUser.money += bet.betAmount * jd;
        bet.winAmount = bet.betAmount * jd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * jd,
        });
        status = "Win";
      }
      if (bet.betType === "sp" && bet.onPlace === closeResult) {
        betUser.money += bet.betAmount * sp;
        bet.winAmount = bet.betAmount * sp;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * sp,
        });
        status = "Win";
      }
      if (bet.betType === "dp" && bet.onPlace === closeResult) {
        betUser.money += bet.betAmount * dp;
        bet.winAmount = bet.betAmount * dp;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * dp,
        });
        status = "Win";
      }
      if (bet.betType === "tp" && bet.onPlace === closeResult) {
        betUser.money += bet.betAmount * tp;
        bet.winAmount = bet.betAmount * tp;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * tp,
        });
        status = "Win";
      }
      if (
        bet.betType === "hs" &&
        bet.openAnk === a &&
        bet.closeNumber === closeResult
      ) {
        betUser.money += bet.betAmount * hs;
        bet.winAmount = bet.betAmount * hs;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * hs,
        });
        status = "Win";
      }
      if (
        bet.betType === "hs" &&
        bet.closeAnk === b &&
        bet.openNumber === openResult
      ) {
        betUser.money += bet.betAmount * hs;
        bet.winAmount = bet.betAmount * hs;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * hs,
        });
        status = "Win";
      }
      if (
        bet.betType === "fs" &&
        bet.openNumber === openResult &&
        bet.closeNumber === closeResult
      ) {
        betUser.money += bet.betAmount * fs;
        bet.winAmount = bet.betAmount * fs;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * fs,
        });
        status = "Win";
      }
      await betUser.save();
      bet.status = status;
      await bet.save();
    }
  }
  successResponse(res, "Result Updated Succesfully");
});

// ======== setGaliGameResult ============
export const setGaliGameResult = tryCatchWrapper(async (req, res) => {
  const { gameType, gameId, result: result1 } = req.body;
  let result = parseInt(result1, 10);
  if (isNaN(result)) {
    return failedResponse(
      res,
      "Result is Not a Number, Please Enter a number in Result Field"
    );
  }
  if (result != 0) {
    if (!gameType || !gameId || !result) {
      return failedResponse(res, "Insufficient InputData");
    }
  }
  const runningGame = await game.findById(gameId);
  if (!runningGame) {
    return failedResponse(res, "Game Not Found");
  }
  const { dsd, djd } = await distribute.findOne();
  if (gameType === "open") {
    const openTime = runningGame.open;
    const currentTime = new Date();

    const [openHour, openMinute] = openTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    // if (isUserAbleToPlaceBet) {
    //   return failedResponse(
    //     res,
    //     "Game is Currently open for this option, You Can't Declare Result"
    //   );
    // }
    if (runningGame.openAnk !== 5000) {
      return failedResponse(
        res,
        "OpenAnk Already declared, Please update the result."
      );
    }
    runningGame.openAnk = result;
    const all_open_close_bets_Win = await oldBet.find({
      gameId,
      gameType: "open",
      status: "Win",
    });
    if (all_open_close_bets_Win.length) {
      for (const bet of all_open_close_bets_Win) {
        const betUser = await user.findById(bet.userId);
        betUser.money -= bet.winAmount;
        bet.status = "Lose";
        await bet.save();
        await betUser.save();
        await transection.create({
          type: "w",
          utr: generateUTRNumber(),
          status: "Approved",
          userId: bet.userId,
          money: bet.winAmount,
        });
      }
    }
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Lose",
      gameType: "open",
    });
    await runningGame.save();
    if (all_open_close_bets.length > 0) {
      for (const bet of all_open_close_bets) {
        let status = "Lose";
        const betUser = await user.findById(bet.userId);
        if (bet.betType === "dsd" && bet.onPlace == result) {
          betUser.money += bet.betAmount * dsd;
          bet.winAmount = bet.betAmount * dsd;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",

            userId: bet.userId,
            money: bet.betAmount * dsd,
          });
          status = "Win";
        }
        await betUser.save();
        bet.status = status;
        await bet.save();
      }
    }
  } else if (gameType === "close") {
    const currentTime = new Date();

    const closeTime = runningGame.close;
    const [openHour, openMinute] = closeTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    // if (isUserAbleToPlaceBet) {
    //   return failedResponse(
    //     res,
    //     "Game is Currently open for this option, You Can't Declare Result"
    //   );
    // }
    if (runningGame.openAnk === 5000) {
      return failedResponse(
        res,
        "OpenAnk Is not decalred, First Declared the Open Result"
      );
    }
    if (runningGame.closeAnk !== 5000) {
      return failedResponse(
        res,
        "CloseAnk Already declared, Please update the result."
      );
    }
    runningGame.closeAnk = result;
    let combination = runningGame.openAnk * 10 + result;
    runningGame.combination = combination;
    runningGame.status = "close";
    const all_open_close_bets_Win = await oldBet.find({
      gameId,
      gameType: "close",
      status: "Win",
    });
    if (all_open_close_bets_Win.length) {
      for (const bet of all_open_close_bets_Win) {
        const betUser = await user.findById(bet.userId);
        betUser.money -= bet.winAmount;
        bet.status = "Lose";
        await bet.save();
        await betUser.save();
        await transection.create({
          type: "w",
          utr: generateUTRNumber(),
          status: "Approved",
          userId: bet.userId,
          money: bet.winAmount,
        });
      }
    }
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Lose",
      gameType: "close",
    });
    await runningGame.save();
    for (const bet of all_open_close_bets) {
      let status = "Lose";
      const betUser = await user.findById(bet.userId);
      if (bet.betType === "dsd" && bet.onPlace == result) {
        betUser.money += bet.betAmount * dsd;
        bet.winAmount = bet.betAmount * dsd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * dsd,
        });
        status = "Win";
      }
      if (bet.betType === "djd" && bet.onPlace === combination) {
        betUser.money += bet.betAmount * djd;
        bet.winAmount = bet.betAmount * djd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * djd,
        });
        status = "Win";
      }
      await betUser.save();
      bet.status = status;
      await bet.save();
    }
  }
  successResponse(res, "Result Updated Succesfully");
});
// ======== setGaliGameResult ============
export const updateGaliGameResult = tryCatchWrapper(async (req, res) => {
  const { gameType, gameId, result: result1 } = req.body;
  let result = parseInt(result1, 10);
  if (isNaN(result)) {
    return failedResponse(
      res,
      "Result is Not a Number, Please Enter a number in Result Field"
    );
  }
  if (result != 0) {
    if (!gameType || !gameId || !result) {
      return failedResponse(res, "Insufficient InputData");
    }
  }
  const runningGame = await game.findById(gameId);
  if (!runningGame) {
    return failedResponse(res, "Game Not Found");
  }
  const { dsd, djd } = await distribute.findOne();
  if (gameType === "open") {
    runningGame.openAnk = result;
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Pending",
      gameType: "open",
    });
    await runningGame.save();
    if (all_open_close_bets.length > 0) {
      for (const bet of all_open_close_bets) {
        let status = "Lose";
        const betUser = await user.findById(bet.userId);
        if (bet.betType === "dsd" && bet.onPlace == result) {
          betUser.money += bet.betAmount * dsd;
          bet.winAmount = bet.betAmount * dsd;
          await transection.create({
            type: "v",
            utr: generateUTRNumber(),
            status: "Winning",

            userId: bet.userId,
            money: bet.betAmount * dsd,
          });
          status = "Win";
        }
        await betUser.save();
        bet.status = status;
        await bet.save();
      }
    }
  } else if (gameType === "close") {
    if (runningGame.openAnk === 5000) {
      return failedResponse(
        res,
        "OpenAnk Is not decalred, First Declared the Open Result"
      );
    }
    runningGame.closeAnk = result;
    let combination = runningGame.openAnk * 10 + result;
    runningGame.combination = combination;
    runningGame.status = "close";
    const all_open_close_bets = await oldBet.find({
      gameId,
      status: "Pending",
      gameType: "close",
    });
    await runningGame.save();
    for (const bet of all_open_close_bets) {
      let status = "Lose";
      const betUser = await user.findById(bet.userId);
      if (bet.betType === "dsd" && bet.onPlace == result) {
        betUser.money += bet.betAmount * dsd;
        bet.winAmount = bet.betAmount * dsd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * dsd,
        });
        status = "Win";
      }
      if (bet.betType === "djd" && bet.onPlace === combination) {
        betUser.money += bet.betAmount * djd;
        bet.winAmount = bet.betAmount * djd;
        await transection.create({
          type: "v",
          utr: generateUTRNumber(),
          status: "Winning",

          userId: bet.userId,
          money: bet.betAmount * djd,
        });
        status = "Win";
      }
      await betUser.save();
      bet.status = status;
      await bet.save();
    }
  }
  successResponse(res, "Result Updated Succesfully");
});
// ======= Dashboard Data ========
export const getDashboardData = tryCatchWrapper(async (req, res) => {
  const nowUTC = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date(nowUTC.getTime() + offset);
  const startOfToday = new Date(nowUTC.setHours(0, 0, 0, 0) + offset);
  // usermodel
  const totalU = (await user.find({ validuser: true })).length;
  const todayU = (
    await user.find({
      createdAt: {
        $gte: startOfToday,
        $lte: now,
      },
      validuser: true,
    })
  ).length;
  const rejectedU = (await user.find({ status: "Rejected" })).length;
  // depositmodel
  const totalDR = (await transection.find({ type: "d" })).length;
  const todayDR = (
    await transection.find({
      type: "d",
      createdAt: {
        $gte: startOfToday,
        $lte: now,
      },
    })
  ).length;
  const totalDA = await transection.aggregate([
    {
      $match: { status: "Approved", type: "d" },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$money" },
      },
    },
  ]);
  const todayDA = await transection.aggregate([
    {
      $match: {
        status: "Approved",
        type: "d",
        createdAt: {
          $gte: startOfToday,
          $lte: now,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$money" },
      },
    },
  ]);

  // withdraw modal
  const totalWR = (await transection.find({ type: "w" })).length;
  const todayWR = (
    await transection.find({
      type: "w",
      createdAt: {
        $gte: startOfToday,
        $lte: now,
      },
    })
  ).length;
  const totalWA = await transection.aggregate([
    {
      $match: { status: "Approved", type: "w" },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$money" },
      },
    },
  ]);
  const totalBonus = await transection.aggregate([
    {
      $match: { type: "b" },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$money" },
      },
    },
  ]);
  const todayBonus = await transection.aggregate([
    {
      $match: {
        type: "b",
        createdAt: {
          $gte: startOfToday,
          $lte: now,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$money" },
      },
    },
  ]);
  const todayWA = await transection.aggregate([
    {
      $match: {
        status: "Approved",
        type: "w",
        createdAt: {
          $gte: startOfToday,
          $lte: now,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$money" },
      },
    },
  ]);
  // oldBetModal
  const totalB = (await oldBet.find()).length;
  const todayB = (
    await oldBet.find({
      createdAt: {
        $gte: startOfToday,
        $lte: now,
      },
    })
  ).length;

  const totalBA = await oldBet.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$betAmount" },
      },
    },
  ]);
  const todayBA = await oldBet.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfToday,
          $lte: now,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$betAmount" },
      },
    },
  ]);
  const totalWin = await oldBet.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$winAmount" },
      },
    },
  ]);
  const todayWin = await oldBet.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfToday,
          $lte: now,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$winAmount" },
      },
    },
  ]);
  // ==== GAME Model =====
  const totalG = (
    await game.find({
      createdAt: {
        $gte: startOfToday,
        $lte: now,
      },
    })
  ).length;
  const data = {
    totalU,
    todayU,
    rejectedU,
    totalDR,
    todayDR,
    totalDA: totalDA[0]?.totalAmount || 0,
    todayDA: todayDA[0]?.totalAmount || 0,
    totalWR,
    todayWR,
    totalWA: totalWA[0]?.totalAmount || 0,
    todayWA: todayWA[0]?.totalAmount || 0,
    totalB,
    todayB,
    totalBA: totalBA[0]?.totalAmount || 0,
    todayBA: todayBA[0]?.totalAmount || 0,
    totalWin: totalWin[0]?.totalAmount || 0,
    todayWin: todayWin[0]?.totalAmount || 0,
    totalG,
    totalBonus: totalBonus[0]?.totalAmount || 0,
    todayBonus: todayBonus[0]?.totalAmount || 0,
  };
  successResponse(res, "All Deshboard Data Fetched Successfully", data);
});
// ============= setAdminBank Details ==============
export const setAdminBank = tryCatchWrapper(async (req, res) => {
  const {
    paytmUpi,
    googleUpi,
    phonepeUpi,
    ahn,
    ifsc,
    account,
    bankName,
    scanner,
    key,
    visible,
  } = req.body;
  // if (
  //   !paytmUpi ||
  //   !googleUpi ||
  //   !phonepeUpi ||
  //   !ahn ||
  //   !ifsc ||
  //   !account ||
  //   !bankName ||
  //   !scanner
  // ) {
  //   return failedResponse(res, "Please Fill up all input fields");
  // }
  if (!key || !visible) {
    return failedResponse(res, "Please Fill up required input fields");
  }
  await bank.deleteOne();
  const bankDetails = await bank.create({
    // paytmUpi,
    // googleUpi,
    phonepeUpi,
    scanner,
    // ahn,
    // ifsc,
    // account,
    // bankName,
    // scanner,
    key,
    visible,
  });
  return successResponse(
    res,
    "Bank Details Added Successfully!..",
    bankDetails
  );
});

// ============ getAdminBankAccount ==============
export const getAdminBankAccount = tryCatchWrapper(async (req, res) => {
  const adminBank = await bank.findOne();
  return successResponse(res, "AdminBank found!", adminBank);
});
// ============ getAdminBankAccount ==============
// export const setShowGame = tryCatchWrapper(async (req, res) => {
//   const show = req.body.show;
//   if (!show) {
//     return failedResponse(res, "Show is Not Persent in Request Body");
//   }
//   if (show === "no") {
//     await user.updateMany({ show: false });
//     await distribute.updateMany({ show: false });
//   }
//   if (show === "yes") {
//     await user.updateMany({ show: true });
//     await distribute.updateMany({ show: true });
//   }
//   return successResponse(res, "Game Screen Updated");
// });
export const setShowGame = tryCatchWrapper(async (req, res) => {
  const show = req.body.show;
  if (!show) {
    return failedResponse(res, "Show is Not Persent in Request Body");
  }
  if (show === "no") {
    await bank.updateMany({ show: false });
    return successResponse(res, "Gateway Disabled");
  }
  if (show === "yes") {
    await bank.updateMany({ show: true });
    return successResponse(res, "Gateway Enabled");
  }
});
// ============ getAdminBankAccount ==============
export const setShowGameUser = tryCatchWrapper(async (req, res) => {
  const show = req.body.show;
  const userId = req.query.userid;
  if (!userId) {
    return failedResponse(res, "UserId Not Persent in Query");
  }
  if (!show) {
    return failedResponse(res, "Show is Not Persent in Request Body");
  }
  if (show === "no") await user.findByIdAndUpdate(userId, { show: false });
  if (show === "yes") await user.findByIdAndUpdate(userId, { show: true });
  return successResponse(res, "Game Screen Updated");
});
// ============ getAdminBankAccount ==============
export const setGameStatus = tryCatchWrapper(async (req, res) => {
  const status = req.body.status;
  const gameId = req.body.gameId;
  if (!status || !gameId) {
    return failedResponse(res, "GameId or Status is not persent");
  }
  await game.findByIdAndUpdate(gameId, { status });
  return successResponse(res, "Game Status Updated Successfully");
});
// =========== notice creation =============

export const createNotice = tryCatchWrapper(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !notice) {
    return failedResponse(res, "Invalid Input Data");
  }
  const newNotice = await notice.create({
    title,
    description,
  });
  return successResponse(res, "Notice Created Succesfully", newNotice);
});

// ======= deleteNotice =========

export const deleteNotice = tryCatchWrapper(async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return failedResponse(res, "NoticeId is not persent");
  }
  await notice.findByIdAndDelete(id);
  return successResponse(res, "Notice deleted Successfully!");
});

// ======== getUserInfo =======
export const getUserInfo = tryCatchWrapper(async (req, res) => {
  const userId = req.query.userid;
  if (!userId) {
    return failedResponse(res, "UserId not found");
  }
  const userProfile = await user.findById(userId);
  const allBets = await oldBet
    .find({ userId })
    .populate({
      path: "gameId",
    })
    .sort({ createdAt: -1 });
  const allTransections = await transection
    .find({ userId })
    .sort({ createdAt: -1 });
  const nowUTC = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date(nowUTC.getTime() + offset);
  const startOfToday = new Date(nowUTC.setHours(0, 0, 0, 0) + offset);
  const totalDAF = await transection.find({
    userId,
    type: "d",
    status: "Approved",
  });
  const totalDA = totalDAF.reduce((acc, doc) => acc + doc.money, 0);
  const todayDAF = await transection.find({
    userId,
    type: "d",
    status: "Approved",
    createdAt: {
      $gte: startOfToday,
      $lte: now,
    },
  });
  const todayDA = todayDAF.reduce((acc, doc) => acc + doc.money, 0);
  const totalVAF = await transection.find({
    userId,
    type: "v",
    status: { $in: ["Approved", "Winning"] },
  });
  const totalVA = totalVAF.reduce((acc, doc) => acc + doc.money, 0);
  const todayVAF = await transection.find({
    userId,
    type: "v",
    status: { $in: ["Approved", "Winning"] },
    createdAt: {
      $gte: startOfToday,
      $lte: now,
    },
  });
  const todayVA = todayVAF.reduce((acc, doc) => acc + doc.money, 0);
  const totalBAF = await transection.find({
    userId,
    type: "p",
    status: { $in: ["Approved", "Debited"] },
  });
  const totalBA = totalBAF.reduce((acc, doc) => acc + doc.money, 0);
  const todayBAF = await transection.find({
    userId,
    type: "p",
    status: { $in: ["Approved", "Debited"] },
    createdAt: {
      $gte: startOfToday,
      $lte: now,
    },
  });
  const todayBA = todayBAF.reduce((acc, doc) => acc + doc.money, 0);
  const totalWAF = await transection.find({
    userId,
    type: "w",
    status: { $in: ["Approved", "Pending"] },
  });
  const totalWA = totalWAF.reduce((acc, doc) => acc + doc.money, 0);
  const todayWAF = await transection.find({
    userId,
    type: "w",
    status: { $in: ["Approved", "Pending"] },
    createdAt: {
      $gte: startOfToday,
      $lte: now,
    },
  });
  const todayWA = todayWAF.reduce((acc, doc) => acc + doc.money, 0);
  let summary = {};
  summary.totalDA = totalDA || 0;
  summary.todayDA = todayDA || 0;
  summary.totalVA = totalVA || 0;
  summary.todayVA = todayVA || 0;
  summary.totalBA = totalBA || 0;
  summary.todayBA = todayBA || 0;
  summary.totalWA = totalWA || 0;
  summary.todayWA = todayWA || 0;
  return successResponse(res, "User Details Fetched", {
    userProfile,
    allBets,
    summary,
    allTransections,
  });
});

// ========= sliderImageAdded ============
export const setSliderImage = tryCatchWrapper(async (req, res) => {
  const image = req.body.scanner;
  if (!image) {
    return failedResponse(res, "Image Not Available");
  }
  const findSlider = await slider.findOne();
  if (!findSlider) {
    const sliderImage = await slider.create({});
    sliderImage.image.push(image);
    await sliderImage.save();
  } else {
    findSlider.image.push(image);
    await findSlider.save();
  }
  return successResponse(res, "Image Added Successfully");
});

// ======= delete Slider Image ========

export const deleteSliderImage = tryCatchWrapper(async (req, res) => {
  const imageName = req.query.image;
  if (!imageName) {
    return failedResponse(res, "Image not found");
  }
  const findSlider = await slider.findOne();
  findSlider.image = findSlider.image.filter((item) => item != imageName);
  await findSlider.save();
  return successResponse(res, "Image Deleted Successfully");
});

// ======== getAllSlider Images ========

export const getAllSliderImages = tryCatchWrapper(async (req, res) => {
  const sliderImage = await slider.findOne();
  if (!sliderImage) {
    return failedResponse(res, "No Image Found");
  }
  successResponse(res, "SliderImage Found Successfully", sliderImage);
});

// ======= edit Game ========
export const editGame = tryCatchWrapper(async (req, res) => {
  const gameId = req.query.gameid;
  if (!gameId) {
    return failedResponse(res, "Invalid GameId");
  }
  const { open, close } = req.body;
  await game.findByIdAndUpdate(gameId, { open, close });
  return successResponse(res, "Game Updated Successfully");
});

// ========== bid Revert ===========
export const bidRevert = tryCatchWrapper(async (req, res) => {
  const gameId = req.query.gameid;
  const allBets = await oldBet.find({ status: "Pending", gameId });
  if (!allBets.length) {
    return failedResponse(res, "No Pending Bet Found!");
  }
  for (const bet of allBets) {
    await user.findByIdAndUpdate(bet.userId, {
      $inc: { money: bet.betAmount },
    });
    bet.status = "Reverted";
    await bet.save();
    await transection.create({
      type: "p",
      utr: generateUTRNumber(),
      status: "Credited",
      userId: bet.userId,
      money: bet.betAmount,
    });
  }
  return successResponse(res, "Bid Reverted Successfully");
});
//========== fetch Single Game ===========
export const fetchSingleGame = tryCatchWrapper(async (req, res) => {
  const uniqueId = req.query.uniqueid;
  if (!uniqueId) {
    return failedResponse(res, "Unique id not persent in query");
  }
  const findGame = await game.findOne({ uniqueId });
  return successResponse(res, "Game Found!", findGame);
});
// =========== setGameOpenDay===============
export const setGameOpenDay = tryCatchWrapper(async (req, res) => {
  const {
    sunday,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    uniqueId,
  } = req.body;
  if (!uniqueId) {
    return failedResponse(res, "uniqueId Not Persent");
  }
  const newdata = await game.updateOne(
    { uniqueId: uniqueId },
    {
      $set: {
        sunday: sunday,
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
        saturday: saturday,
      },
    }
  );

  return successResponse(res, "Game Active/Close Day Update Successfully");
});

// ========== DeleteGameResult ===========

export const deleteGameResult = tryCatchWrapper(async (req, res) => {
  const { gameType, gameId } = req.body;
  if (!gameType || !gameId) {
    return failedResponse(res, "GameType or GameId Not persent");
  }

  if (gameType === "open") {
    await game.findByIdAndUpdate(gameId, { openResult: 5000, openAnk: 5000 });
  } else if (gameType === "close") {
    await game.findByIdAndUpdate(gameId, {
      closeResult: 5000,
      closeAnk: 5000,
      status: "active",
    });
  }
  return successResponse(res, "Game Result Deleted Successfully");
});
