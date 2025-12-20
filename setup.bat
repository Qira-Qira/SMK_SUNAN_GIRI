@echo off
REM SMK Sunan Giri - Automated Setup Script for Windows
REM This script automatically sets up the project for development

echo.
echo ================================
echo SMK Sunan Giri - Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo x Node.js is not installed. Please install Node.js 18+ first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo. & echo [OK] Node.js version: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo x npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo. & echo [OK] npm version: %NPM_VERSION%

echo.
echo ================================
echo Setup Process Starting...
echo ================================
echo.

REM Step 1: Install dependencies
echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo x Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 2: Generate Prisma Client
echo [2/4] Generating Prisma Client...
call npm run prisma:generate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo x Failed to generate Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client generated
echo.

REM Step 3: Run migrations
echo [3/4] Running database migrations...
echo Note: This will create all necessary tables in your PostgreSQL database
call npm run prisma:migrate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo x Failed to run migrations
    echo Make sure PostgreSQL is running and DATABASE_URL is correct in .env.local
    pause
    exit /b 1
)
echo [OK] Database migrations completed
echo.

REM Step 4: Seed database
echo [4/4] Seeding database with initial data...
call npm run prisma:seed
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ! Warning: Failed to seed database
    echo You can retry with: npm run prisma:seed
)
echo [OK] Database seeded
echo.

echo.
echo ================================
echo [OK] Setup Completed Successfully!
echo ================================
echo.
echo Next steps:
echo 1. Update .env.local with your PostgreSQL credentials if needed
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo Default Admin Login:
echo   Username: admin
echo   Password: admin123
echo.
echo ! Remember to change the admin password in production!
echo.
pause
