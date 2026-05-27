targetScope = 'resourceGroup'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Short lowercase prefix used for resource names.')
param namePrefix string = 'othello'

@description('Container image tag deployed by the Container App.')
param imageTag string = 'latest'

@description('Container Apps workload profile minimum/maximum vCPU and memory. Consumption keeps this cheap for demos.')
param containerCpu string = '0.5'

@description('Container memory allocation.')
param containerMemory string = '1Gi'

@description('Deploy the Container App. Set false for the first pass before the image exists in ACR.')
param deployContainerApp bool = true

var suffix = uniqueString(resourceGroup().id, namePrefix)
var sanitizedPrefix = toLower(replace(namePrefix, '-', ''))
var registryName = take('${sanitizedPrefix}${suffix}', 50)
var environmentName = '${namePrefix}-env-${suffix}'
var containerAppName = '${namePrefix}-app-${suffix}'
var imageName = 'othello'
var image = '${registry.properties.loginServer}/${imageName}:${imageTag}'

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {}
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = if (deployContainerApp) {
  name: containerAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: registry.properties.loginServer
          username: registry.name
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: registry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'othello'
          image: image
          env: [
            {
              name: 'PORT'
              value: '8080'
            }
          ]
          resources: {
            cpu: json(containerCpu)
            memory: containerMemory
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

output registryName string = registry.name
output registryLoginServer string = registry.properties.loginServer
output imageName string = imageName
output imageTag string = imageTag
output containerAppName string = containerAppName
output containerAppUrl string = deployContainerApp ? 'https://${containerApp!.properties.configuration.ingress.fqdn}' : ''
