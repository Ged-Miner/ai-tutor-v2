#!/bin/bash

# PostgreSQL Backup Script for AI Tutor
# Usage: ./scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="ai_tutor_db"
DB_USER="postgres"
DB_NAME="ai_tutor"
BACKUP_DIR="./backup"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup of database: $DB_NAME"
echo "📅 Timestamp: $DATE"

# Create backup
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: backup_$DATE.sql"

    # Compress backup
    gzip $BACKUP_DIR/backup_$DATE.sql
    echo "🗜️  Backup compressed: backup_$DATE.sql.gz"

    # Delete backups older than 30 days
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
    echo "🧹 Cleaned up backups older than 30 days"

    # Show backup size
    BACKUP_SIZE=$(du -h $BACKUP_DIR/backup_$DATE.sql.gz | cut -f1)
    echo "📦 Backup size: $BACKUP_SIZE"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "✨ Backup complete!"
