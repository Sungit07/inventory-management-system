import jwt, { SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "OPERATOR";
}


export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set. Check your .env file.");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};