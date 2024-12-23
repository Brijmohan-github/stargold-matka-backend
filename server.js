import { connect } from "mongoose";
import "dotenv/config";
import app from "./app.js";

connect(process.env.DB_URI)
  .then(() => console.log("DB connection successfull!...."))
  .catch((err) => console.log(err.message, `\n Db Connection Failed!...`));

// starting the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Error starting the server: ", err.message);
});
