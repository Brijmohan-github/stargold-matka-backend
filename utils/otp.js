import { caching } from "cache-manager";
// Create a memory cache with a maximum of 100,000 items
export const memoryCache = await caching("memory", {
  max: 100000,
  ttl: 150 * 1000, // milliseconds
});

// Function to generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
}

// Function to generate and store OTP in cache
export async function generateAndStoreOTP(userid) {
  const otp = generateOTP();
  console.log("🚀 ~ generateAndStoreOTP ~ otp:", otp)
  const cacheKey = "otp_" + userid;
  try {
    await memoryCache.set(cacheKey, otp);
  } catch (err) {
    console.error("Error storing OTP in cache:", err);
  }
  return otp;
}
