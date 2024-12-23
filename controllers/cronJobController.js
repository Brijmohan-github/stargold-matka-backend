import schedule from "node-schedule";
import user from "../models/userModel.js";
import game from "../models/gameModal.js";
import { bet } from "../models/betModal.js";
import transection from "../models/transectionModel.js";
import { getDayNameFromNumber } from "../utils/getDayNameFromNumber.js";

// ==========  Schedule task to run this in every 5 minutes =========

schedule.scheduleJob("*/5 * * * *", async () => {
  try {
    await user.deleteMany({ validuser: false });
  } catch (error) {
    console.error("Error during scheduled task:", error);
  }
});

// ======= Schedule task for 00:01 AM ========

schedule.scheduleJob("1 0 * * *", async () => {
  try {
    // console.log("********* Game Creation Start ***************");
    await bet.deleteMany();
    await transection.deleteMany({
      status: { $in: ["Pending", "Rejected"] },
    });
    let today = new Date();
    today.setHours(today.getHours() + 5);
    today.setMinutes(today.getMinutes() + 30);
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday = new Date(
      yesterday.toISOString().split("T")[0] + "T00:00:00.000Z"
    );
    today = new Date(today.toISOString().split("T")[0] + "T00:00:00.000Z");
    console.log(today, yesterday);
    const allGames = await game.find({
      createdAt: {
        $gte: yesterday,
        $lte: today,
      },
    });
    let now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    console.log(now);
    const day = getDayNameFromNumber(today.getDay());
    for (const item of allGames) {
      let status = "close";
      if (item[day] === true) {
        status = "active";
      }
      let newItemData = item.toObject({ versionKey: false });
      delete newItemData._id;
      newItemData = {
        ...newItemData,
        status,
        openResult: 5000,
        closeResult: 5000,
        combination: 5000,
        closeAnk: 5000,
        openAnk: 5000,
        canPlaceBetonOpen: true,
        canPlaceBetonClose: true,
        createdAt: now,
        resetDate: now,
      };
      await game.create(newItemData);
      item.status = "close";
      await item.save();
    }
    // console.log("********* Game Creation End ***************");
  } catch (error) {
    console.error("Error during scheduled task:", error);
  }
});
