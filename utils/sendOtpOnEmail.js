import nodemailer from "nodemailer";

export async function sendOtpOnEmail(recipient, otp) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "khanvashid763@gmail.com",
      pass: "myqa nlyd fcti qene",
    },
  });

  try {
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP for Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .card {
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
        padding: 30px;
      }
      h1 {
        color: #333333;
        margin-bottom: 20px;
      }
      p {
        color: #666666;
        font-size: 16px;
        margin-bottom: 10px;
      }
      .otp-box {
        background-color: #eeeeee;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
        text-align: center;
      }
      .otp {
        font-size: 36px;
        color: #333333;
        margin: 0;
      }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1>OTP for Verification</h1>
          <p>Your One-Time Password (OTP) is:</p>
          <div class="otp-box">
            <h2 class="otp">${otp}</h2>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    let mailOptions = {
      from: "khanvashid763@gmail.com",
      to: recipient,
      subject: "Otp for Matka verification",
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
