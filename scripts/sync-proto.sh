#!/usr/bin/env bash
# Sync proto files from neuro-pipeline repo
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PIPELINE_PROTO="${DASHBOARD_ROOT}/../repo/proto"

if [ ! -d "${PIPELINE_PROTO}" ]; then
    echo "Error: neuro-pipeline proto dir not found at ${PIPELINE_PROTO}"
    echo "Expected: ../repo/proto/ relative to neuro-dashboard/"
    exit 1
fi

cp "${PIPELINE_PROTO}/neuro_pipeline.proto" "${DASHBOARD_ROOT}/proto/"
echo "Synced: proto/neuro_pipeline.proto"
echo "Source: ${PIPELINE_PROTO}/neuro_pipeline.proto"
