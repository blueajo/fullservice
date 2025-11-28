#!/bin/bash

echo "== Syncing production DB =="
./sync-db.sh

echo ""
echo "== Syncing production files =="
./sync-files.sh

echo ""
echo "== Clearing Drupal caches =="
ddev drush cr

echo ""
echo "🎉 Local environment is now fully in sync with production — DB + media files!"

