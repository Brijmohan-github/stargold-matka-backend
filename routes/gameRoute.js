import { Router } from "express";
import {
  createGame,
  deleteGame,
  getAllDistribution,
  placeBet,
  placeBetOnMotor,
  setDistributeSettings,
} from "../controllers/gameControllers.js";
import { protect } from "../controllers/accessController.js";
import { getAllGames } from "../controllers/userController.js";

const router = Router();

// ======== gameController (admin pannel) =======

router
  .post("/create", protect, createGame)
  .post("/setdistribution", protect, setDistributeSettings)
  .delete("/deletegame", protect, deleteGame);
// ======== (user pannel) gameController ==========
router
  .post("/place", protect, placeBet)
  .post("/placebetonmotor", protect, placeBetOnMotor)
  .get("/getallgames", getAllGames)
  .get("/alldistribution", getAllDistribution);

export { router as gameRouter };
