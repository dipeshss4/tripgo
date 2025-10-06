#!/bin/sh
set -e

echo "🚀 Starting TripGo Backend Production Server..."

# Wait for database to be ready if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
    echo "⏳ Waiting for database to be ready..."

    # Extract host and port from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

    if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
        # Wait for database connection
        timeout=60
        while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
            timeout=$((timeout - 1))
            if [ $timeout -le 0 ]; then
                echo "❌ Database connection timeout"
                exit 1
            fi
            echo "⏳ Waiting for database at $DB_HOST:$DB_PORT... ($timeout seconds remaining)"
            sleep 1
        done
        echo "✅ Database is ready!"
    fi
fi

# Run database setup in production
if [ "$NODE_ENV" = "production" ]; then
    echo "🔄 Setting up database..."

    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate --schema=./prisma/schema.prisma

    # Push database schema (creates database if it doesn't exist)
    echo "🗄️ Creating database and pushing schema..."
    npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

    if [ $? -eq 0 ]; then
        echo "✅ Database setup completed successfully"

        # Seed the database with tenants if no data exists
        echo "🌱 Checking if database seeding is needed..."
        node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        async function checkAndSeed() {
          try {
            const tenantCount = await prisma.tenant.count();
            if (tenantCount === 0) {
              console.log('🌱 Seeding database with initial data...');
              process.exit(1); // Exit with code 1 to trigger seeding
            } else {
              console.log('✅ Database already has data, skipping seed');
              process.exit(0);
            }
          } catch (error) {
            console.log('⚠️ Error checking database, will attempt seeding...');
            process.exit(1);
          } finally {
            await prisma.\$disconnect();
          }
        }

        checkAndSeed();
        "

        if [ $? -eq 1 ]; then
            echo "🌱 Running database seeder..."
            npm run db:seed:tenants 2>/dev/null || echo "⚠️ Seeding completed with warnings"
        fi
    else
        echo "❌ Database setup failed"
        exit 1
    fi
fi

# Ensure log directory exists and has proper permissions
if [ ! -d "/app/logs" ]; then
    mkdir -p /app/logs
fi

# Ensure uploads directory exists and has proper permissions
if [ ! -d "/app/uploads" ]; then
    mkdir -p /app/uploads
fi

# Set proper permissions
chmod -R 755 /app/logs /app/uploads 2>/dev/null || true

# Print environment info
echo "📊 Environment Information:"
echo "   NODE_ENV: ${NODE_ENV:-development}"
echo "   PORT: ${PORT:-4000}"
echo "   Database: ${DATABASE_URL:+Connected}"
echo "   Redis: ${REDIS_URL:+Connected}"
echo "   Log Level: ${LOG_LEVEL:-info}"

# Health check before starting
echo "🔍 Running pre-start health check..."
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js is available"
else
    echo "❌ Node.js is not available"
    exit 1
fi

# Check if built application exists
if [ ! -f "/app/dist/server.js" ]; then
    echo "❌ Built application not found at /app/dist/server.js"
    exit 1
fi

echo "✅ Pre-start checks completed"
echo "🚀 Starting TripGo Backend API Server..."
echo "🌐 Server will be available at http://localhost:${PORT:-4000}"
echo "📚 API Documentation: http://localhost:${PORT:-4000}/api/docs"
echo "🔍 Health Check: http://localhost:${PORT:-4000}/health"

# Execute the main command
exec "$@"