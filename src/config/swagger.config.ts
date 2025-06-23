import swaggerJsDoc from "swagger-jsdoc";
import expressBasicAuth from "express-basic-auth";
import config from "./env.config";

// Swagger documentation options
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
        url: `http://localhost:${config.PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

// Generate Swagger specification
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Flag to determine if Swagger UI should be available
export const isSwaggerAvailable = ["development", "staging"].includes(
  config.NODE_ENV
);

// Swagger basic auth configuration
export const swaggerAuth = expressBasicAuth({
  users: {
    admin: "swagger-secret",
  },
  challenge: true,
  realm: "API Documentation",
});

export default swaggerDocs;
