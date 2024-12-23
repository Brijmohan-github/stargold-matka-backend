import { Router } from "express";
import {
  acceptDeposit,
  acceptWithdraw,
  adminLogin,
  changeAdminPassword,
  changeUserStatus,
  getAllBets,
  getAllDeposit,
  getAllUser,
  getAllWithDraw,
  getDashboardData,
  getLiveGameData,
  lockGame,
  setGameResult,
  setAdminBank,
  deleteNotice,
  createNotice,
  adminRegister,
  getUserInfo,
  updateUserBalance,
  setGameStatus,
  changeBetResult,
  getAllGameBets,
  getAdminBankAccount,
  setShowGame,
  setShowGameUser,
  setSliderImage,
  deleteSliderImage,
  getAllSliderImages,
  editGame,
  bidRevert,
  updateGameResult,
  setGameOpenDay,
  setGaliGameResult,
  updateGaliGameResult,
  showNormalGameWinner,
  resetWinner,
  getStatusBets,
  fetchSingleGame,
  deleteGameResult,
} from "../controllers/adminController.js";
import { addScanner } from "../controllers/multerController.js";
import { adminProtect } from "../controllers/accessController.js";
import { getAllNotices } from "../controllers/userController.js";
const router = Router();

router
  .post("/adminregister", adminRegister)
  .post("/adminlogin", adminLogin)
  .put("/changeadminpassword", adminProtect, changeAdminPassword)
  .put("/updateuserbalance", adminProtect, updateUserBalance)
  .get("/getalluser", adminProtect, getAllUser)
  .get("/getalldeposit", adminProtect, getAllDeposit)
  .get("/getallwithdraw", adminProtect, getAllWithDraw)
  .put("/acceptdeposit", adminProtect, acceptDeposit)
  .put("/acceptwithdraw", adminProtect, acceptWithdraw)
  .put("/changeuserstatus", adminProtect, changeUserStatus)
  .get("/dashboard", adminProtect, getDashboardData)
  .get("/allbets", adminProtect, getAllBets)
  .post("/lockgame", adminProtect, lockGame)
  .put("/updategameresult", adminProtect, updateGameResult)
  .post("/setgameresult", adminProtect, setGameResult)
  .post("/setgaligameresult", adminProtect, setGaliGameResult)
  .put("/updategaligameresult", adminProtect, updateGaliGameResult)
  .get("/livegamedata", adminProtect, getLiveGameData)
  .post("/setadminbank", adminProtect, addScanner, setAdminBank)
  .delete("/deletenotice", adminProtect, deleteNotice)
  .post("/createnotice", adminProtect, createNotice)
  .get("/getallnotices", adminProtect, getAllNotices)
  .get("/getuserinfo", adminProtect, getUserInfo)
  .put("/setgamestatus", adminProtect, setGameStatus)
  .post("/changebetresult", adminProtect, changeBetResult)
  .get("/getadminbank", adminProtect, getAdminBankAccount)
  .get("/getallgamebet", adminProtect, getAllGameBets)
  .get("/getbetwithstatus", adminProtect, getStatusBets)
  .put("/showgame", adminProtect, setShowGame)
  .put("/showusergame", adminProtect, setShowGameUser)
  .post("/setsliderimage", adminProtect, addScanner, setSliderImage)
  .put("/deletesliderimage", adminProtect, deleteSliderImage)
  .get("/allsliderimage", adminProtect, getAllSliderImages)
  .put("/editgame", adminProtect, editGame)
  .put("/revertbid", adminProtect, bidRevert)
  .post("/shownormalgamewinner", adminProtect, showNormalGameWinner)
  .put("/setgameopenday", adminProtect, setGameOpenDay)
  .post("/resetwinner", adminProtect, resetWinner)
  .get("/fetchsinglegame", adminProtect, fetchSingleGame)
  .put("/deletegameresult", adminProtect, deleteGameResult);

export { router as adminRouter };
