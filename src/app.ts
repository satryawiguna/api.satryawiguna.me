import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { rateLimit } from "express-rate-limit";
import "dotenv/config";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import permissionRoutes from "./routes/permission.routes";

// Import middlewares
import errorHandler from "./middlewares/error.middleware";
import { authenticate } from "./middlewares/auth.middleware";

// Import configurations
import swaggerDocs, {
  swaggerAuth,
  isSwaggerAvailable,
} from "./config/swagger.config";

// Initialize express app
const app = express();

// Apply middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/roles", authenticate, roleRoutes);
app.use("/api/permissions", authenticate, permissionRoutes);

// Swagger route with basic authentication for development and staging environments only
if (isSwaggerAvailable) {
  app.use(
    "/api-docs",
    swaggerAuth,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs)
  );
} else {
  // In production, return 404 for Swagger route
  app.use("/api-docs", (_, res) => {
    res.status(404).json({
      status: "error",
      message: "API documentation is not available in production",
    });
  });
}

// Health check route
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

export default app;
