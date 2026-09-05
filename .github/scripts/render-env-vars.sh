#!/usr/bin/env bash
# Renders the TRD section 8 configuration contract into a gcloud --env-vars-file.
# Reads ALL_SECRETS (toJSON(secrets)) so a new secret needs adding in one place: the list below.
# Output is JSON, which gcloud's YAML parser accepts, so values containing commas,
# "@" or quotes survive - a Postgres URL breaks --set-env-vars on any delimiter we could pick.
set -euo pipefail

out=${1:?usage: render-env-vars.sh <output path>}

# Every name in docs/TRD.md section 8. Names absent from the repository secrets are
# omitted rather than written empty, so the server sees them unset.
jq -n --argjson all "${ALL_SECRETS:?ALL_SECRETS is unset}" '
  $all
  | {
      GONKA_API_KEY,
      GONKA_BASE_URL_OPENAI,
      DATABASE_URL,
      BETTER_AUTH_SECRET,
      BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GUEST_EMAIL,
      GUEST_PASSWORD,
      MASCOT_ENABLED,
      WORKER_CONCURRENCY,
      GEMINI_API_KEY,
      GEMINI_MODEL,
      TAVILY_API_KEY,
      CHAT_PROVIDER,
      CHAT_MODEL
    }
  | with_entries(select(.value != null and .value != ""))
' > "$out"

printf 'Wrote %s with: %s\n' "$out" "$(jq -r 'keys | join(", ")' < "$out")"
