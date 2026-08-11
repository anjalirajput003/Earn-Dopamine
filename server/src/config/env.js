const requiredEnvironmentVariables = [
  "MONGODB_URI",
  "CLIENT_URL",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const parsedPort = Number.parseInt(process.env.PORT ?? "5000", 10);

if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
  throw new Error("PORT must be a valid integer between 1 and 65535.");
}

const allowedNodeEnvironments = ["development", "test", "production"];

const nodeEnvironment = process.env.NODE_ENV ?? "development";

if (!allowedNodeEnvironments.includes(nodeEnvironment)) {
  throw new Error(
    `NODE_ENV must be one of: ${allowedNodeEnvironments.join(", ")}`,
  );
}

const env = Object.freeze({
  nodeEnv: nodeEnvironment,
  port: parsedPort,
  clientUrl: process.env.CLIENT_URL,
  mongodbUri: process.env.MONGODB_URI,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
});

export default env;
