#!/bin/bash

# Optional: set a password for ngrok (leave empty for none)
AUTH=""

# Detect the DDEV HTTP port automatically
HTTP_PORT=$(ddev describe -j | jq -r '.services.web.hostports[0]')

# Fallback if detection fails
if [ -z "$HTTP_PORT" ] || [ "$HTTP_PORT" = "null" ]; then
  echo "Failed to detect HTTP port from DDEV, using default 32821"
  HTTP_PORT=32821
fi

echo "Using DDEV HTTP port: $HTTP_PORT"

# Start ngrok with optional auth
if [ -n "$AUTH" ]; then
  echo "Starting ngrok with authentication..."
  ngrok http -auth="$AUTH" "$HTTP_PORT"
else
  echo "Starting ngrok..."
  ngrok http "$HTTP_PORT"
fi
