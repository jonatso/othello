# Azure Container Apps Deployment

This deploys Othello as a single Azure Container App. Socket.IO runs directly in the Node server; no Azure Web PubSub resource is used.

## Resources

- Azure Container Registry
- Azure Container Apps managed environment
- Azure Container App with public ingress on port `8080`

The app keeps game state in memory, so the Container App is configured with `minReplicas: 1` and `maxReplicas: 1`.

## Deploy

```sh
bash infra/deploy-container-app.sh
```

Optional overrides:

```sh
RESOURCE_GROUP=Jonatan NAME_PREFIX=othello IMAGE_TAG=latest bash infra/deploy-container-app.sh
```

The script deploys the Bicep template, builds the Docker image in ACR, restarts the Container App revision, and prints the URL.
