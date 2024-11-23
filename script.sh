#!/bin/bash

# Variables
SOURCE_DIR=$1     # Directory to back up
BACKUP_DIR=$2     # Directory where the backup will be saved
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.tar.gz"

# Function to print usage
function usage() {
    echo "Usage: $0 <source_directory> <backup_directory>"
    exit 1
}

# Check if both arguments are provided
if [[ -z "$SOURCE_DIR" || -z "$BACKUP_DIR" ]]; then
    echo "Error: Missing arguments."
    usage
fi

# Check if source directory exists
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "Error: Source directory does not exist."
    exit 1
fi

# Check if backup directory exists, if not create it
if [[ ! -d "$BACKUP_DIR" ]]; then
    echo "Backup directory does not exist. Creating it..."
    mkdir -p "$BACKUP_DIR"
fi

# Create the backup
tar -czf "$BACKUP_DIR/$BACKUP_FILE" -C "$SOURCE_DIR" .

# Verify the backup was created successfully
if [[ $? -eq 0 ]]; then
    echo "Backup successful: $BACKUP_DIR/$BACKUP_FILE"
else
    echo "Error: Backup failed."
    exit 1
fi
