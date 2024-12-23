async function sendOtpViaSMS(phone, otp) {
  try {
    const response = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.OTP_KEY}&variables_values=${otp}&route=otp&numbers=${phone}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error) {
    return false;
  }
}

export default sendOtpViaSMS;
