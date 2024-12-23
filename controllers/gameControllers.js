import game from "../models/gameModal.js";
import { bet, oldBet } from "../models/betModal.js";
import tryCatchWrapper from "../wrappers/tryCatchWrapper.js";
import { failedResponse, successResponse } from "../wrappers/response.js";
import distribute from "../models/distributeModel.js";
import user from "../models/userModel.js";
import transection from "../models/transectionModel.js";
import { generateUTRNumber } from "../utils/generateUTRNumber.js";
// ========== create game ===============
export const createGame = tryCatchWrapper(async (req, res) => {
  const { name, open, close, delhi, starline } = req.body;
  if (!starline && (!name || !open || !close)) {
    return failedResponse(res, "Please provide required Values!");
  }
  const newGame = await game.create({
    name,
    open,
    close,
    delhi,
    starline: starline,
    uniqueId: generateUTRNumber(),
  });
  successResponse(res, "Game Created Successfully!", newGame);
});
//============= placeBet ===============
export const placeBet = tryCatchWrapper(async (req, res) => {
  const {
    gameid: gameId,
    betAmount,
    betType,
    onPlace,
    gameType,
    closeAnk,
    openAnk,
    openNumber,
    closeNumber,
  } = req.body;
  const userId = req.userId;
  const player = await user.findById(userId);
  if (player.money < betAmount) {
    return failedResponse(res, "Insufficient Balance");
  }

  const currentGame = await game.findById(gameId);
  if (!currentGame) {
    return failedResponse(res, "Incorrect GameID");
  }
  const openTime = currentGame.open;
  const currentTime = new Date();
  if (
    (gameType === "open" &&
      ["sd", "sp", "dp", "tp", "ssd", "ssp", "stp", "sdp"].includes(betType)) ||
    ["jd", "fs", "hs", "ssd", "ssp", "stp", "sdp"].includes(betType)
  ) {
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    if (!isUserAbleToPlaceBet) {
      return failedResponse(res, "You Can't Place bet on this Bet Option Now");
    }
  }
  const closeTime = currentGame.close;
  if (gameType === "close" && ["sd", "sp", "dp", "tp"].includes(betType)) {
    const [openHour, openMinute] = closeTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    if (!isUserAbleToPlaceBet) {
      return failedResponse(res, "You Can't Place bet on this Bet Option Now");
    }
  }

  if (player.status === "Rejected" || player.status === "Blocked") {
    return failedResponse(
      res,
      "Your Account is Blocked By Admin, You Can't place bet on this game. Please contact customer support for more help"
    );
  }
  await user.updateOne({ _id: userId }, { $inc: { money: -betAmount } });
  await transection.create({
    type: "p",
    money: betAmount,
    status: "Debited",
    utr: generateUTRNumber(),
    userId,
  });
  const placedBet = await bet.create({
    userId,
    gameId,
    betAmount,
    betType,
    onPlace,
    gameType,
    closeAnk,
    openAnk,
    openNumber,
    closeNumber,
  });
  await oldBet.create({
    userId,
    gameId,
    betAmount,
    betType,
    onPlace,
    gameType,
    closeAnk,
    openAnk,
    openNumber,
    closeNumber,
  });
  successResponse(res, "Bet Placed Successfully!", placedBet);
});
//============== SPMOTOR And DPMOTOR ===========
export const placeBetOnMotor = tryCatchWrapper(async (req, res) => {
  const {
    gameid: gameId,
    betAmount,
    betSingleAmount,
    betType,
    onPlaceArray,
    gameType,
  } = req.body;
  const userId = req.userId;
  const player = await user.findById(userId);
  if (player.money < betAmount) {
    return failedResponse(res, "Insufficient Balance");
  }
  await user.updateOne({ _id: userId }, { $inc: { money: -betAmount } });
  const currentGame = await game.findById(gameId);
  if (!currentGame) {
    return failedResponse(res, "Incorrect GameID");
  }
  const openTime = currentGame.open;
  const currentTime = new Date();
  if (
    (gameType === "open" &&
      ["sd", "sp", "dp", "tp", "dsd"].includes(betType)) ||
    ["jd", "fs", "hs", "djd"].includes(betType)
  ) {
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    if (!isUserAbleToPlaceBet) {
      return failedResponse(res, "You Can't Place bet on this Bet Option Now");
    }
  }
  const closeTime = currentGame.close;
  if (
    gameType === "close" &&
    ["sd", "sp", "dp", "tp", "dsd"].includes(betType)
  ) {
    const [openHour, openMinute] = closeTime.split(":").map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isUserAbleToPlaceBet =
      currentHour < openHour ||
      (currentHour === openHour && currentMinute < openMinute);
    if (!isUserAbleToPlaceBet) {
      return failedResponse(res, "You Can't Place bet on this Bet Option Now");
    }
  }

  if (player.status === "Rejected" || player.status === "Blocked") {
    return failedResponse(
      res,
      "Your Account is Blocked By Admin, You Can't place bet on this game. Please contact customer support for more help"
    );
  }
  await transection.create({
    type: "p",
    money: betAmount,
    status: "Debited",
    utr: generateUTRNumber(),
    userId,
  });
  await player.save();
  onPlaceArray.forEach(async (item) => {
    await bet.create({
      userId,
      gameId,
      betAmount: betSingleAmount,
      betType,
      onPlace: item,
      gameType,
    });
    await oldBet.create({
      userId,
      gameId,
      betAmount: betSingleAmount,
      betType,
      onPlace: item,
      gameType,
    });
  });
  successResponse(res, "Bet Placed Successfully!");
});
// ============ setDistribution amount =========
export const setDistributeSettings = tryCatchWrapper(async (req, res) => {
  const {
    sd,
    jd,
    sp,
    dp,
    tp,
    hs,
    fs,
    dsd,
    djd,
    ssd,
    sjd,
    ssp,
    sdp,
    sb,
    rb,
    nrb,
    phone,
    email,
    whatsapp,
    telegram,
    liveresult,
    minwl,
    maxwl,
    minda,
    maxda,
    minba,
    maxba,
    mint,
    maxt,
    withdrawOpen,
    withdrawClose,
    deposit,
    withdraw,
  } = req.body;
  if (
    !sd ||
    !jd ||
    !sp ||
    !dp ||
    !tp ||
    !hs ||
    !fs ||
    !dsd ||
    !djd ||
    !minwl ||
    !maxwl ||
    !minda ||
    !maxda ||
    !minba ||
    !maxba ||
    !mint ||
    !maxt ||
    !nrb ||
    !phone ||
    !whatsapp ||
    !email ||
    !telegram ||
    !liveresult ||
    !withdrawOpen ||
    !withdrawClose ||
    !deposit ||
    !withdraw
  ) {
    return failedResponse(res, "Please fill all the input fields!");
  }
  await distribute.deleteOne();
  await distribute.create({
    sd,
    jd,
    sp,
    dp,
    ssd,
    sjd,
    ssp,
    sb,
    rb,
    sdp,
    tp,
    hs,
    fs,
    dsd,
    djd,
    nrb,
    phone,
    email,
    whatsapp,
    telegram,
    liveresult,
    minwl,
    maxwl,
    minda,
    maxda,
    minba,
    maxba,
    mint,
    maxt,
    withdrawOpen,
    withdrawClose,
    deposit,
    withdraw
  });
  return successResponse(res, "Settings Updated!");
});
// ========== deleteGame ===========
export const deleteGame = tryCatchWrapper(async (req, res) => {
  const id = req.query.gameid;
  if (!id) {
    return failedResponse(res, "please provide gameId");
  }
  await game.findByIdAndDelete(id);
  return successResponse(res, "Game Deleted Successfully", getAllDistribution);
});

// ============ getAllDistribution Settings =========
export const getAllDistribution = tryCatchWrapper(async (req, res) => {
  const getAllDistribution = await distribute.findOne();
  if (!getAllDistribution) {
    return failedResponse(res, "No Data Found!", 500);
  }
  return successResponse(
    res,
    "Distribution settings fetched Successfully",
    getAllDistribution
  );
});
