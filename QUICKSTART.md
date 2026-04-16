# BidHub Backend - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Setup Instructions

### 1. Database Setup

```bash
# Option A: Using the provided SQL script
sudo -u postgres psql -f database-setup.sql

# Option B: Manual setup
sudo -u postgres psql
```

Then run in psql:
```sql
CREATE DATABASE bidhub;
CREATE USER bidhub_user WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE bidhub TO bidhub_user;
\c bidhub
GRANT ALL ON SCHEMA public TO bidhub_user;
```

### 2. Environment Configuration

The `.env` file is already configured. Update if needed:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=bidhub_user
DB_PASSWORD=strongpassword
DB_NAME=bidhub
JWT_SECRET=change_this_to_secure_random_string
JWT_EXPIRATION=7d
PORT=3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Access the API

- **API Base URL**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api

## Quick API Testing

### Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create an Auction (use token from login)
```bash
curl -X POST http://localhost:3000/auctions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Vintage Watch",
    "description": "A rare vintage watch from the 1960s",
    "startingPrice": 100,
    "endTime": "2025-12-31T23:59:59.000Z"
  }'
```

### List Public Auctions
```bash
curl http://localhost:3000/auctions
```

## Creating an Admin User

After registration, you'll need to manually set a user as admin in the database:

```bash
sudo -u postgres psql -d bidhub
```

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env` match your database setup
- Verify the database exists: `\l` in psql

### Permission Denied for Schema Public
Run this in psql as postgres user:
```sql
\c bidhub
GRANT ALL ON SCHEMA public TO bidhub_user;
```

### Port Already in Use
Change the PORT in `.env`:
```env
PORT=3001
```

### Module Not Found Errors
Clear and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Create Users**: Register regular users via API
2. **Create Admin**: Manually update role to 'ADMIN' in database
3. **Create Auctions**: Users submit auctions (PENDING status)
4. **Approve Auctions**: Admin approves pending auctions
5. **Place Bids**: Users bid on approved auctions

## Development Tips

- **Watch Mode**: `npm run start:dev` auto-reloads on file changes
- **Debug Mode**: `npm run start:debug` for debugging
- **Linting**: `npm run lint` to fix code style
- **Formatting**: `npm run format` with Prettier

## Architecture Notes

- **Modules**: Auth, Users, Auctions, Bids, Admin
- **Pattern**: Layered architecture (Controller → Service → Repository)
- **Entities**: User, Auction, Bid
- **Guards**: JwtAuthGuard for auth, RolesGuard for authorization
- **Validation**: DTOs with class-validator
- **Documentation**: Swagger at `/api`

## Support

For issues or questions:
1. Check the IMPLEMENTATION_SUMMARY.md for detailed documentation
2. Review the Swagger documentation at http://localhost:3000/api
3. Check the NestJS documentation: https://docs.nestjs.com
