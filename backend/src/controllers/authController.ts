import { Response } from "express";
import bcrypt from "bcryptjs";

import { AuthenticatedRequest } from "../middleware/auth";
import { db } from "../services/db";
import { generateToken } from "../utils/generateTokens";

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  const user = db.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({
      error: "Invalid email or password.",
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return res.status(401).json({
      error: "Invalid email or password.",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      error: "Account is disabled.",
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  });
};
