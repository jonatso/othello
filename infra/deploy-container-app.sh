#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-Jonatan}"
NAME_PREFIX="${NAME_PREFIX:-othello}"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d%H%M%S)}"
LOCATION="${LOCATION:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

deploy_resources() {
  local deploy_container_app="$1"

  if [[ -n "$LOCATION" ]]; then
    az deployment group create \
      --resource-group "$RESOURCE_GROUP" \
      --template-file "$SCRIPT_DIR/main.bicep" \
      --parameters namePrefix="$NAME_PREFIX" imageTag="$IMAGE_TAG" location="$LOCATION" deployContainerApp="$deploy_container_app" \
      --output json
  else
    az deployment group create \
      --resource-group "$RESOURCE_GROUP" \
      --template-file "$SCRIPT_DIR/main.bicep" \
      --parameters namePrefix="$NAME_PREFIX" imageTag="$IMAGE_TAG" deployContainerApp="$deploy_container_app" \
      --output json
  fi
}

echo "Deploying Azure Container Apps base resources to resource group: $RESOURCE_GROUP"
DEPLOYMENT_JSON="$(deploy_resources false)"

ACR_NAME="$(node -e "console.log(JSON.parse(process.argv[1]).properties.outputs.registryName.value)" "$DEPLOYMENT_JSON")"
CONTAINER_APP_NAME="$(node -e "console.log(JSON.parse(process.argv[1]).properties.outputs.containerAppName.value)" "$DEPLOYMENT_JSON")"
CONTAINER_APP_URL="$(node -e "console.log(JSON.parse(process.argv[1]).properties.outputs.containerAppUrl.value)" "$DEPLOYMENT_JSON")"
IMAGE_NAME="$(node -e "console.log(JSON.parse(process.argv[1]).properties.outputs.imageName.value)" "$DEPLOYMENT_JSON")"

echo "Building and pushing image in ACR: $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"
az acr build \
  --registry "$ACR_NAME" \
  --image "$IMAGE_NAME:$IMAGE_TAG" \
  "$REPO_ROOT"

echo "Deploying Container App"
DEPLOYMENT_JSON="$(deploy_resources true)"
CONTAINER_APP_URL="$(node -e "console.log(JSON.parse(process.argv[1]).properties.outputs.containerAppUrl.value)" "$DEPLOYMENT_JSON")"

echo "Deployed: $CONTAINER_APP_URL"
