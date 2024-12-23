import axios from "axios";
import bank from "../models/bankModel.js";
import { failedResponse, successResponse } from "../wrappers/response.js";
import tryCatchWrapper from "../wrappers/tryCatchWrapper.js";
import { generateUTRNumber } from "../utils/generateUTRNumber.js";
import { generateRandomEmail } from "../utils/generateRandomEmail.js";
import user from "../models/userModel.js";
import transection from "../models/transectionModel.js";
function formatDate() {
  const date = new Date();
  let day = date.getDate(); // Gets the day of the month
  let month = date.getMonth() + 1; // Gets the month (0-11, thus +1 for 1-12)
  let year = date.getFullYear(); // Gets the 4-digit year
  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;
  return `${day}-${month}-${year}`;
}

export const createPayment = tryCatchWrapper(async (req, res) => {
  const { amount, customer_name, customer_mobile } = req.body;
  if (!amount || !customer_name || !customer_mobile) {
    return failedResponse(res, "Invalid Input");
  }
  const banks = await bank.findOne();
  const key = banks.key;
  if (!key) {
    return failedResponse(res, "Gateway Key Not available");
  }
  const client_txn_id = generateUTRNumber();
  const paymentBody = {
    key,
    client_txn_id,
    amount,
    p_info: "StarGold Matka",
    customer_name,
    customer_email: generateRandomEmail(customer_name),
    customer_mobile,
    redirect_url: `${process.env.BACKEND_URL}/user/gettransectionstatus`,
  };
  const response = await axios.post(
    "https://api.ekqr.in/api/create_order",
    paymentBody
  );
  let payment_url = response?.data?.data?.payment_url;
  const upi_intent = response?.data?.data?.upi_intent;
  if (!payment_url) {
    return failedResponse(res, "Payment Url Not Defined, Please Try again ");
  }
  return successResponse(res, "Payment Received", {
    url: payment_url,
    upi_intent: upi_intent,
    client_txn_id,
  });
});

export const getTransectionStatus = tryCatchWrapper(async (req, res) => {
  const { client_txn_id } = req.query;
  const banks = await bank.findOne();
  const key = banks.key;
  if (!key) {
    return failedResponse(res, "Gateway Key Not available");
  }
  const statusBody = {
    key,
    client_txn_id,
    txn_date: formatDate(),
  };
  let response = await axios.post(
    "https://api.ekqr.in/api/check_order_status",
    statusBody
  );
  if (response && response.data && response.data.data) {
    response = response.data.data;
  } else {
    return failedResponse(res, "Something went wrong, please try again ");
  }
  let money = response.amount;
  const phone = Number(response.customer_mobile);
  const findUser = await user.findOne({ phone });
  if (!findUser) {
    return failedResponse(res, "User Not Found");
  }
  await transection.create({
    type: "d",
    status: response.status,
    money: response.amount,
    userId: findUser._id,
    utr: client_txn_id,
    upi_txn_id: response.upi_txn_id,
  });
  if (response.status === "success") {
    findUser.money += response.amount;
    await findUser.save();
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Successful</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #4CAF50;
            }
            p {
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Transaction Successful</h1>
            <p>Your transaction was successful.</p>
            <p>Client Transaction Id: ${client_txn_id}</p>
            <p>Amount: ${money}</p>
        </div>
    </body>
    </html>
`);
    return;
  } else {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Failed</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #f44336;
                }
                p {
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Transaction Failed</h1>
                <p>Your transaction has failed.</p>
                <p>Client Transaction Id: ${client_txn_id}</p>
            <p>Amount: ${money}</p>
            </div>
        </body>
        </html>
    `);
    return;
  }
});

// ========== Self Gateway ============
export const getTransectionRequest = tryCatchWrapper(async (req, res) => {
  const userId = req.userId;
  const money = req.body.money;
  const utr = req.body.utr;
  if (!utr || !money) {
    return failedResponse(res, "Money or UTR not persent");
  }
  const txn = await transection.create({
    money,
    userId,
    utr,
    type: "d",
    status: "Pending",
  });
  return successResponse(
    res,
    "Exciting news! We've got your transaction request! Expect your funds in your wallet within 5 minutes. If not, just reach out to us on WhatsApp. Thanks for trusting us!",
    txn
  );
});
