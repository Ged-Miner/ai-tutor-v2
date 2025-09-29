#!/bin/bash

# PostgreSQL Restore Script for AI Tutor
# Usage: ./scripts/restore-db.sh <backup_file>
# Example: ./scripts/restore-db.sh backup/backup_20250929_143022.sql.gz

if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: ./scripts/restore-db.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh backup/backup_*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"
DB_CONTAINER="ai_tutor_db"
DB_USER="postgres"
DB_NAME="ai_tutor"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
echo "📁 Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🔄 Starting restore..."

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "🗜️  Decompressing backup..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c $BACKUP_FILE > $TEMP_FILE
    SQL_FILE=$TEMP_FILE
else
    SQL_FILE=$BACKUP_FILE
fi

# Drop and recreate database
echo "🗑️  Dropping existing database..."
docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Restore backup
echo "📥 Restoring database..."
cat $SQL_FILE | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME

# Clean up temp file if we decompressed
if [[ $BACKUP_FILE == *.gz ]]; then
    rm $TEMP_FILE
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi

echo "✨ Restore complete!"
