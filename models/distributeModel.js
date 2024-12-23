import { Schema, model } from "mongoose";
const distributeSchema = new Schema({
  sd: { type: Number, default: 10 },
  jd: { type: Number, default: 100 },
  sp: { type: Number, default: 160 },
  dp: { type: Number, default: 320 },
  tp: { type: Number, default: 700 },
  hs: { type: Number, default: 1000 },
  fs: { type: Number, default: 10000 },
  // delhi games
  dsd: { type: Number, default: 9 },
  djd: { type: Number, default: 90 },
  // starline games
  ssd: { type: Number, default: 10 },
  ssp: { type: Number, default: 160 },
  sdp: { type: Number, default: 320 },
  stp: { type: Number, default: 700 },
  // settings (senderBonus, receiverBonus, NonReceiverBounus, MinimumWithdrawalLimit)
  sb: { type: Number, default: 5 }, //sender bonus
  rb: { type: Number, default: 5 }, // receipt bonus
  nrb: { type: Number, default: 5 }, // no referral bonus
  minwl: { type: Number, default: 1000 }, //minimum withdrawal limit
  maxwl: { type: Number, default: 50000 }, // maximum withdrawal limit
  minda: { type: Number, default: 300 }, //minimum deposit amount
  maxda: { type: Number, default: 100000 }, //max deposit amount
  minba: { type: Number, default: 10 }, //min bet amount
  maxba: { type: Number, default: 50000 }, //maximum bet amount
  mint: { type: Number, default: 50000 }, //minimum transfer amount
  maxt: { type: Number, default: 500000 }, //maximum transfer amount
  // admin contact details
  phone: { type: Number, default: 917412926634 },
  email: { type: String, default: "onlinematka11@gmail.com" },
  whatsapp: { type: Number, default: 917412926634 },
  liveresult: { type: String, default: "https://mainkalyanmatka.com/" },
  deposit: { type: String, default: "https://fzeetechz.in/deposit" },
  withdraw: { type: String, default: "https://fzeetechz.in/withdraw" },
  telegram: { type: String, default: "t.me/main_online_matka_app" },
  // withdraw time
  withdrawOpen: { type: String, default: "06:00" },
  withdrawClose: { type: String, default: "10:00" },
  show: {
    type: Boolean,
    default: true, // true and false
  },
});

const distribute = model("Distribute", distributeSchema);

export default distribute;
