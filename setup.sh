#!/bin/bash

# SMK Sunan Giri - Automated Setup Script
# This script automatically sets up the project for development

echo "================================"
echo "SMK Sunan Giri - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Step 3: Run migrations
echo "🗄️  Running database migrations..."
echo "Note: This will create all necessary tables in your PostgreSQL database"
npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    echo "Make sure PostgreSQL is running and DATABASE_URL is correct in .env.local"
    exit 1
fi
echo "✅ Database migrations completed"
echo ""

# Step 4: Seed database
echo "🌱 Seeding database with initial data..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to seed database"
    echo "You can retry with: npm run prisma:seed"
fi
echo "✅ Database seeded"
echo ""

echo "================================"
echo "✅ Setup Completed Successfully!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your PostgreSQL credentials if needed"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Default Admin Login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  Remember to change the admin password in production!"
