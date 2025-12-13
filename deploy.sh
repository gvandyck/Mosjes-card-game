#!/bin/bash
# Configuration
HOST="eightytwenty.nl"
USER="YOUR_USERNAME"
REMOTE_PATH="/path/to/public_html/cardgame"
LOCAL_PATH="./docs/"

# Check if rsync is installed
if ! command -v rsync &> /dev/null; then
    echo "rsync could not be found"
    exit 1
fi

echo "Deploying to $HOST..."
# -a: archive mode (preserves permissions, times, etc.)
# -v: verbose
# -z: compress
# -e: specify ssh as remote shell
rsync -avz -e ssh "$LOCAL_PATH" "$USER@$HOST:$REMOTE_PATH"

echo "Deployment complete!"
