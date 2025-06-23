# Node.js Express TypeScript RESTful API

A robust, fully-featured RESTful API built with Node.js, Express, TypeScript, and PostgreSQL, following clean architecture principles.

## Features

- **TypeScript** - Type-safe code development
- **Express** - Fast, unopinionated web framework for Node.js
- **PostgreSQL** - Robust relational database
- **Prisma ORM** - Modern database toolkit
- **Authentication & Authorization** - JWT-based authentication and role-based access control
- **API Documentation** - Swagger/OpenAPI documentation
- **Input Validation** - Request validation using Zod
- **Testing** - Unit and integration tests with Jest
- **Clean Architecture** - Well-defined separation of concerns

## Project Structure

```
├── src/
│   ├── config/        # Application configuration
│   ├── controllers/   # Request handlers
│   ├── services/      # Business logic
│   ├── repositories/  # Data access layer
│   ├── routes/        # Route definitions
│   ├── models/        # Data models
│   ├── middlewares/   # Express middlewares
│   ├── validators/    # Request validation schemas
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── database/      # Database related code
│   ├── app.ts         # Express application setup
│   └── server.ts      # Server entry point
├── prisma/            # Prisma schema and migrations
├── tests/             # Test files
├── .env               # Environment variables (not committed)
├── .env.example       # Example environment variables
├── package.json       # Project dependencies
└── tsconfig.json      # TypeScript configuration
```

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- npm or yarn

## Getting Started

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/api.satryawiguna.me.git
cd api.satryawiguna.me
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Update .env with your own values
```

4. Set up the database

```bash
# Create a PostgreSQL database
npx prisma migrate dev
npx prisma generate
```

5. Seed the database

```bash
npm run seed
```

### Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### API Documentation

API documentation is available at:

```
http://localhost:3000/api-docs
```

**Access Information**:

- API documentation is only available in development and staging environments
- Basic authentication is required to access the documentation
  - Username: `admin`
  - Password: `swagger-secret`

### Default Users

After seeding, the following user is available:

- Email: admin@example.com
- Password: Admin@123
- Role: ADMIN

## Available Scripts

- `npm run dev` - Run the application in development mode
- `npm run build` - Build the application for production
- `npm start` - Start the application in production mode
- `npm test` - Run tests
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase
- `npm run seed` - Seed the database
- `npm run migrate:dev` - Run database migrations in development
- `npm run migrate:deploy` - Deploy database migrations in production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio

## Authentication

The API uses JWT-based authentication. To access protected endpoints:

1. Register a new user or use the default admin account
2. Login to receive an access token
3. Include the token in the Authorization header: `Bearer <token>`

## Authorization

The API implements role-based access control:

- **ADMIN** - Full access to all endpoints
- **STAFF** - Limited access for regular operations
- **DEVELOPER** - Access to API documentation and limited features

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

For production deployment:

1. Set up your environment variables for production
2. Build the application: `npm run build`
3. Deploy database migrations: `npm run migrate:deploy`
4. Start the application: `npm start`

## License

This project is licensed under the MIT License.
