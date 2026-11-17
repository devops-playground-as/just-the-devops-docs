# Kubernetes Secrets

I *Secret* contengono informazioni codificate in Base64 e vengono decodificati *on-the-fly* quando sono passati al Pod che ne fa uso. I Secret sono molto simili alle risorse ConfigMap ma sono fatti specificatamente per informazioni che devono rimanere segrete (es. password, token, chiavi).

## Tipologie di Secret

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

## L'uso del Base64 e le caratteristiche dei Secret

L'utilizzo del Base64 non è però una proprietà di sicurezza, dato che non si tratta di un metodo di cifratura - in termini di confidenzialità, è pressocchè identico a lasciare il contenuto informativo in *plaintext* - ma il suo utilizzo si rende necessario per memorizzare anche tipi di dato in formato binario.

I Secret hanno altre caratteristiche legate alla loro implementazione che li rendono più sicuri di una ConfigMap.

- Un Secret è presente solo sui nodi dove sono eseguiti quei Pod che lo utilizzano.
- I Secret sui nodi dove sono presenti vengono memorizzati solo in memoria, in un file system temporaneo (*tmpfs*), e non sono mai scritti su memoria persistente. I Secret sono rimossi quando i Pod che li utilizzano vengono eliminati.
- I Secret possono essere memorizzati cifrati in *etcd*.

**I Secret, così come le ConfigMap, da Kubernetes 1.21 possono essere resi immutabili, grazie al campo `immutable`** che se impostato a `true` non permette di aggiornare la risorsa quando viene creata. Questa funzionalità oltre ad evitare aggiornamenti indesiderati, consente anche a Kubernetes di stare in ascolto su oggetti definiti come non modificabili, ottimizzando le performance del cluster. L'unico modo per modificare un Secret immutabile è cancellarlo e ricrearlo, riavviando poi ogni Pod che lo referenzia.

## Secure Configuration

Nonostante le caratteristiche dei Secret, è importante capire come gestirli e memorizzarli in sicurezza, per evitare che il loro contenuto sia visibile ad attori non autorizzati. In un approccio GitOps i Secret dovrebbero essere memorizzati cifrati nei repository Git, per poi essere decifrati nel loro processo di trasferimento verso il cluster Kubernetes. L'operazione di decifratura potrebbe avvenire a livello applicativo, ma richiederebbe del tempo per essere implementata. Esistono approcci più trasparenti e che ricadono principalmente in due categorie: ***out-of-cluster encryption*** e ***centralized secret management***.

**Riferimenti**.

- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Kubernetes Patterns - Reusable Elements for Designing Cloud Native Applications, Bilgin Ibryam and Roland Huß](https://www.oreilly.com/library/view/kubernetes-patterns/9781492050278/)