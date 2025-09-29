#!/bin/bash

# PostgreSQL Reset Script for AI Tutor
# Drops database, recreates it, runs migrations, and seeds data
# Usage: ./scripts/reset-db.sh

DB_CONTAINER="ai_tutor_db"
DB_USER="postgres"
DB_NAME="ai_tutor"

echo "⚠️  WARNING: This will completely reset the database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo "🔄 Starting database reset..."

# Drop and recreate database
echo "🗑️  Dropping database..."
docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
echo "📦 Creating fresh database..."
docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Run migrations
echo "🔨 Running migrations..."
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Database reset complete!"
echo ""
echo "📊 Database is now fresh with seed data"
