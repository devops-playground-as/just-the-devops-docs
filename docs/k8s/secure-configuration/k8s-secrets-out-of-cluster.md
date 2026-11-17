# Out-of-cluster encryption 

Le informazioni vengono memorizzate cifrate fuori dal cluster Kubernetes e la loro trasformazione avviene appena prima di entrare nel cluster o all'interno del cluster grazie ad un operatore sempre in esecuzione. Ci sono diversi progetti che consentono di implementare questa tecnica e in questa pagina ne sono descritti alcuni.

## Sealed Secrets

## External Secrets

**L'External Secrets Operator (ESO) è un operatore Kubernetes che consente di inserire le informazioni presenti in un determinato *Secret Management System (SMS)*** - l'operatore ne supporta molti, come AWS Secrets Manager, Hashicorp Vault e Google Secrets Manager - **all'interno dei Secret**. ESO consente quindi di sincronizzare i segreti da API esterne in Kubernetes.

![External Secrets Operator](/img/k8s/eso-op.png)


Per capire il meccanismo di funzionamento dell'operatore, bisogna considerare il suo data model che si basa principalmente su due *Custom Resource Definition (CRD)*.

![External Secrets Operator](/img/k8s/eso-op-architecture.png)

Il `SecretStore` che è la risorsa che detiene il tipo e la configurazione per accedere al sistema SMS esterno (nel caso AWS Secret Manager il riferimento ad access key id e secret access key); l'`ExternalSecret` - che referenzia un `SecretStore` - dove è contenuta l'informazione su quali dati recuperare. Il controller utilizzerà l'`ExternalSecret` come blueprint per creare un Kubernetes Secret con al suo interno i dati contenuti nel sistema SMS.

```yaml
apiVersion: external-secrets.io/v1
kind: SecretStore
metadata:
  name: secretstore-sample
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        secretRef:
          accessKeyIDSecretRef:
            name: awssm-secret
            key: access-key
          secretAccessKeySecretRef:
            name: awssm-secret
            key: secret-access-key
```

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: example
spec:
  refreshInterval: 1h0m0s
  secretStoreRef:
    name: secretstore-sample
    kind: SecretStore
  target:
    name: secret-to-be-created
    creationPolicy: Owner
  data:
  - secretKey: secret-key-to-be-managed
    remoteRef:
      key: provider-key
      version: provider-key-version
      property: provider-key-property
  dataFrom:
  - extract:
      key: remote-key-in-the-provider
```

## Sops

**Riferimenti**

- [External Secrets Operator](https://external-secrets.io/latest/)