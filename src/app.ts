import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
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
import { checkRole } from "./middlewares/role.middleware";

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "RESTful API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

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

// Swagger route with role-based access
app.use(
  "/api-docs",
  authenticate,
  checkRole(["DEVELOPER"]),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

export default app;
