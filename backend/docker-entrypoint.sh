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

# Run database migrations in production
if [ "$NODE_ENV" = "production" ]; then
    echo "🔄 Running database migrations..."
    npx prisma migrate deploy --schema=./prisma/schema.prisma

    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed successfully"
    else
        echo "❌ Database migrations failed"
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