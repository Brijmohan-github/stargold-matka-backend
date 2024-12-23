import jwt from "jsonwebtoken";
import "dotenv/config";
export const generateToken = (
  userId,
  expiresIn = process.env.JWT_USER_EXPIRES_IN,
  secretKey = process.env.JWT_SECRECT_KEY
) => {
  return jwt.sign({ userId }, secretKey, { expiresIn });
};

export const generateAdminToken = (
  userId,
  expiresIn = process.env.JWT_ADMIN_EXPIRES_IN,
  secretKey = process.env.JWT_SECRECT_KEY
) => {
  return jwt.sign({ userId }, secretKey, { expiresIn });
};
