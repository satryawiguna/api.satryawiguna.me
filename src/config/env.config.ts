import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
}

// Default config
const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "no-reply@api.satryawiguna.me",
};

// Validate required config values
const requiredEnvVars: Array<keyof Config> = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!config[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
