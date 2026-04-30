#!/bin/bash

# CircleWorks API Setup Script

set -e

echo "🚀 CircleWorks API Setup"
echo "========================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Copy .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please configure .env with your settings"
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

# Create database
echo ""
echo "🗄️  Setting up database..."
echo "Make sure PostgreSQL is running and DATABASE_URL is set in .env"
read -p "Press Enter to continue with database setup..."

npm run db:push

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Configure .env with your settings"
echo "   2. Run 'npm run start:dev' to start development server"
echo "   3. Visit http://localhost:3001/docs for Swagger documentation"
echo ""
echo "📚 Documentation: https://github.com/circleworks/api"
echo "💬 Support: support@circleworks.com"
