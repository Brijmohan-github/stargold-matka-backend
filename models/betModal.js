import { Schema, model } from "mongoose";

const betSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
    betAmount: {
      type: Number,
      default: 0,
    },
    gameType: {
      type: String,
      default: "open", //open and close
    },
    betType: {
      type: String,
      required: true, //sd,jd,sp,dp,tp,hs,fs,dsd,djd
    },
    onPlace: {
      type: Number,
    },
    openAnk:Number,
    closeAnk:Number,
    openNumber:Number,
    closeNumber:Number,
    winAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Pending", //  status pending, win and lose, Reverted,check
    },
    createdAt: {
      type: Date,
      default: () => {
        let now = new Date();
        now.setHours(now.getHours() + 5);
        now.setMinutes(now.getMinutes() + 30);
        return now;
      },
    },
  },
  
);

const bet = model("Bet", betSchema);
const oldBet = model("OldBet", betSchema);
export { bet, oldBet };
