#!/bin/bash

# ============================================================
# Sync DreamHost public files to DDEV environment
# ============================================================

REMOTE_SSH_USER="dh_ruycr7"
REMOTE_SSH_HOST="iad1-shared-b8-30.dreamhost.com"
REMOTE_FILES_PATH="fullserviceoffice.com/fullservice/web/sites/default/files"
LOCAL_FILES_PATH="web/sites/default/files"  # DDEV's mount point for public files

echo "== Syncing public files from DreamHost to DDEV =="

rsync -avz \
  ${REMOTE_SSH_USER}@${REMOTE_SSH_HOST}:${REMOTE_FILES_PATH}/ \
  ${LOCAL_FILES_PATH}/

echo "== File sync complete =="

