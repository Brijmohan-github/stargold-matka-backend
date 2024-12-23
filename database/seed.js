import distribute from "../models/distributeModel.js";
import "dotenv/config";
import { connect, disconnect } from "mongoose";
import bank from "../models/bankModel.js";

async function seed() {
  try {
    await connect(process.env.DB_URI);
    console.log("======= database connection started =======");
    // Seeding database
    await distribute.deleteMany();
    await distribute.create({});
    await bank.deleteMany();
    await bank.create({});
    console.log("===== Database seeding Done ========");
    // Close the database connection
    await disconnect();
    console.log("======= database connection closed =======");
  } catch (error) {
    console.error("==== Error in Database Seeding =====", error);
  }
}

await seed();
