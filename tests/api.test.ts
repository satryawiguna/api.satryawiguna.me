import request from "supertest";
import app from "../src/app";
import prisma from "../src/database/client";

// Mock the database connection
jest.mock("../src/database/client", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  userRole: {
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app).post("/api/auth/register").send({
        password: "Password1!",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should return 400 if password is too short", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "short",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    // Add more tests for registration
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: "Password1!",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    // Add more tests for login
  });

  // Add more test suites for other endpoints
});

describe("User Controller", () => {
  // Add tests for user endpoints
});

describe("Role Controller", () => {
  // Add tests for role endpoints
});

describe("Permission Controller", () => {
  // Add tests for permission endpoints
});
