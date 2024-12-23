import { Schema, model } from "mongoose";

const noticeSchema = new Schema(
  {
    title: String,
    description: String,
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

const notice = model("Notice", noticeSchema);
export default notice;
