import { Schema, model } from "mongoose";

const transectionSchema = new Schema({
  depositScreenshot: String,
  money: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Pending", //"Pending","Approved","Rejected","Failure",Success
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    default: "d", // "d" for deposit , "w for withdraw","b for bonus","p" for place bet, "v" for victory
  },
  utr: Number,
  upi_txn_id: Number,
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

const transection = model("Transection", transectionSchema);

export default transection;
