#!/usr/bin/env bash
# Deploy the production Cloud Run service from a laptop when GitHub Actions cannot run.
# Use this only while Actions is gated at the org level (issue #260).
# Prerequisites: logged-in gcloud with `gcloud auth login`, Docker daemon, jq and curl.
# The new revision inherits the previous revision's environment variables from Cloud Run.
# Secrets live in GitHub and production, never in a laptop .env.

set -euo pipefail

PROJECT=muba-m1ku
REGION=asia-southeast1
SERVICE=cekgu
ALLOW_DIRTY=false
ALLOW_BRANCH=false
NO_SMOKE=false

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --allow-dirty) ALLOW_DIRTY=true; shift ;;
    --branch) ALLOW_BRANCH=true; shift ;;
    --no-smoke) NO_SMOKE=true; shift ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

# Preflight: gcloud present and has an active account
if ! command -v gcloud &> /dev/null; then
  echo "gcloud not found" >&2
  exit 1
fi
active=$(gcloud auth list --filter=status:ACTIVE --format='value(account)')
if [ -z "$active" ]; then
  echo "gcloud auth login" >&2
  exit 1
fi

# Preflight: Docker daemon reachable
if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon not reachable" >&2
  exit 1
fi

# Preflight: working tree is clean and on main
if [ "$ALLOW_DIRTY" = false ] && [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty; use --allow-dirty to override" >&2
  exit 1
fi
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ] && [ "$ALLOW_BRANCH" = false ]; then
  echo "Not on main branch ($current_branch); use --branch to override" >&2
  exit 1
fi

# Preflight: jq and curl present
if ! command -v jq &> /dev/null; then
  echo "jq not found" >&2
  exit 1
fi
if ! command -v curl &> /dev/null; then
  echo "curl not found" >&2
  exit 1
fi

# Get the git SHA
sha=$(git rev-parse HEAD)
image="${REGION}-docker.pkg.dev/${PROJECT}/cekgu/cekgu:${sha}"

# Configure Docker for Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build with linux/amd64 platform (Cloud Run requirement; Mac builds arm64 by default)
docker build --platform linux/amd64 --tag "$image" .

# Push to Artifact Registry
docker push "$image"

# Deploy: secrets live in GitHub and the last production revision, never in a laptop .env
# The new revision inherits the previous revision's environment variables since none are given
revision=$(gcloud run deploy "$SERVICE" \
  --image "$image" \
  --project "$PROJECT" \
  --region "$REGION" \
  --platform managed \
  --port 8080 \
  --allow-unauthenticated \
  --ingress all \
  --min-instances 1 \
  --max-instances 1 \
  --no-cpu-throttling \
  --memory 1Gi \
  --timeout 300 \
  --quiet \
  --format='value(status.latestCreatedRevisionName)')

echo "Built revision $revision"

# Route all traffic to the new revision
gcloud run services update-traffic "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --to-revisions "$revision=100" \
  --quiet

# Verify: re-describe the service and fail unless the untagged 100% revision equals the one built
service=$(gcloud run services describe "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --format=json)
url=$(jq -r '.status.url' <<<"$service")
serving=$(jq -r '[.status.traffic[] | select(.percent == 100 and .tag == null) | .revisionName] | first // "none"' <<<"$service")

if [ "$serving" != "$revision" ]; then
  printf 'Traffic is on %s but this run deployed %s.\n' "$serving" "$revision" >&2
  exit 1
fi

code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 60 "$url/")
if [ "$code" != '200' ]; then
  printf 'Production returned %s for GET /.\n' "$code" >&2
  exit 1
fi

echo "Production is live at $url serving $revision"

# Smoke test with E2E_BASE_URL, skipped with --no-smoke
if [ "$NO_SMOKE" = false ]; then
  E2E_BASE_URL="$url" bun run e2e
fi
