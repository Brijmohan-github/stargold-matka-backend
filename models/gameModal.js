import { Schema, model } from "mongoose";
const gameSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  uniqueId: { type: Number, default: 0 },
  open: {
    type: String,
    required: true,
  },
  close: {
    type: String,
  },
  canPlaceBetonOpen: {
    type: Boolean,
    default: true,
  },
  canPlaceBetonClose: {
    type: Boolean,
    default: true,
  },
  openResult: {
    type: Number,
    default: 5000,
  },
  combination: {
    type: Number,
    default: 5000,
  },
  closeResult: {
    type: Number,
    default: 5000,
  },
  openAnk: {
    type: Number,
    default: 5000,
  },
  closeAnk: {
    type: Number,
    default: 5000,
  },
  category: {
    type: String,
    default: "m", // o and m (where o is selfGame and m for marketGame)
  },
  status: {
    type: String,
    default: "active", // active and close
  },
  lock: {
    type: Boolean,
    default: false,
  },
  sunday: { type: Boolean, default: true },
  monday: { type: Boolean, default: true },
  tuesday: { type: Boolean, default: true },
  wednesday: { type: Boolean, default: true },
  thursday: { type: Boolean, default: true },
  friday: { type: Boolean, default: true },
  saturday: { type: Boolean, default: true },
  delhi: { type: Boolean, default: false },
  starline: { type: Boolean, default: false },
  resetDate: {
    type: Date,
    default: () => {
      let now = new Date();
      now.setHours(now.getHours() + 5);
      now.setMinutes(now.getMinutes() + 30);
      return now;
    },
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
});

const game = model("Game", gameSchema);

export default game;
