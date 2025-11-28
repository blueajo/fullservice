#!/bin/bash

# ============================================================
# Sync DreamHost production database → DDEV local environment
# ============================================================

# ---- FILL THESE IN ----
REMOTE_SSH_USER="dh_ruycr7"
REMOTE_SSH_HOST="iad1-shared-b8-30.dreamhost.com"
REMOTE_DB_NAME="fullservice"
REMOTE_DB_USER="fullservice_o"
REMOTE_DB_PASS="mijsuR-9pyvza-symcag"

# ---- DreamHost MySQL host ----
REMOTE_DB_HOST="mysql.fullserviceoffice.com"

# ---- File name for dump ----
DUMP_NAME="prod.sql"

echo ""
echo "== Step 1: Exporting remote production DB from DreamHost =="
ssh ${REMOTE_SSH_USER}@${REMOTE_SSH_HOST} \
"mysqldump -u ${REMOTE_DB_USER} -p${REMOTE_DB_PASS} -h ${REMOTE_DB_HOST} ${REMOTE_DB_NAME} > ${DUMP_NAME}"

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Remote mysqldump failed"
  exit 1
fi

echo ""
echo "== Step 2: Copying DB dump to local =="
scp ${REMOTE_SSH_USER}@${REMOTE_SSH_HOST}:${DUMP_NAME} .

if [ $? -ne 0 ]; then
  echo "❌ ERROR: SCP download failed"
  exit 1
fi

echo ""
echo "== Step 3: Importing into DDEV =="
ddev import-db --src=${DUMP_NAME}

if [ $? -ne 0 ]; then
  echo "❌ ERROR: DDEV import-db failed"
  exit 1
fi

echo ""
echo "== Step 4: Clearing Drupal cache =="
ddev drush cr

echo ""
echo "🎉 Done! Your local DDEV database now matches DreamHost production."
echo ""

