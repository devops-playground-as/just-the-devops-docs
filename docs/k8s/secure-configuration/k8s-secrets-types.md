# Tipi di Secrets

Nel momento in cui viene creato un Secret, è possibile specificarne il `type`. Il tipo del Secret viene utilizzato per facilitare la gestione programmatica dei dati al suo interno. Kubernetes fornisce alcuni tipi built-in per diversi *use cases*. 

| Tipo built-in | Contenuto | Use case |
|---|---|---|
| `Opaque` | Dati arbitrari | Passowrd, credenziali database, fruibili dai Pod |
| `kubernetes.io/service-account-token` | Token di autenticazione associato ad un service account | Autenticare un'applicazione al Kubernetes API Server |
| `kubernetes.io/dockercfg` | Credenziali per container registry nel formato legacy `~/.dockercfg` | Autenticare il kubelet verso registri privati per scaricare le immagini. Il segreto viene referenziato tramite `imagePullSecrets` |
| `kubernetes.io/dockerconfigjson` | Credenziali per container registry nel formato `~/.docker/config.json` | Stesso use case del `type` `kubernetes.io/dockercfg`, ma ricorrendo al formato moderno |
| `kubernetes.io/basic-auth` | Username e password per la *basic authentication* | Applicazioni che utilizzano credenziali nel formato basic |
| `kubernetes.io/ssh-auth` | Chiave SSH | Accesso in SSH, ad esempio per repository Git privati |
| `kubernetes.io/tls` | Informazioni per configurare TLS: certificato (`tls.crt`) e chiave (`tls.key`) | Configurare comunicazioni TLS, come nel caso di HTTPS sull'Ingress Controller |
| `bootstrap.kubernetes.io/token` | Token di bootstrap e relativi metadati | Autenticare i nuovi nodi, ad esempio nel caso di `kubeadm join` |