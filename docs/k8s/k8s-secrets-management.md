# Gestione dei segreti

I *Secret* contengono informazioni cifrate in Base64 e vengono decodificati *on-the-fly* quando vengono passati al Pod che ne fa uso. I Secret sono molto simili alle risorse ConfigMap ma sono fatti specificatamente per informazioni che devono rimanere segrete (es. password, token, chiavi).

## Tipologie di Secret

## L'uso del Base64 e le caratteristiche dei Secret

L'utilizzo del Base64 non è però una proprietà di sicurezza, dato che non si tratta di un metodo di cifratura - da un punto di vista della sicurezza, è pressocchè identico a lasciare il contenuto informativo in *plaintext* - ma il suo utilizzo si rende necessario per memorizzare anche tipi di dato in formato binario.

I Secret hanno altre caratteristiche legate alla loro implementazione che li rendono più sicuri di una ConfigMap.

- Un Secret è presente solo sui nodi dove sono eseguiti quei Pod che li utilizzano.

- Sui nodi dove i Secret sono presenti, vengono memorizzati solo in memoria in un file system temporaneo (*tmpfs*) e non sono mai scritti su memoria persistente. I Secret sono rimossi quando i Pod che li utilizzano vengono eliminati.

- I Secret possono essere memorizzati cifrati in *etcd*.

I Secret, così come le ConfigMap, da Kubernetes 1.21 possono essere resi immutabili, grazie al campo `immutable` che se impostato a `true` non permette di aggiornare la risorsa quando viene creata. Questa funzionalità oltre ad evitare aggiornamenti indesiderati, consente anche a Kubernetes di stare in ascolto su oggetti definiti come non modificabili, ottimizzando le performance del cluster. L'unico modo per modificare un Secret immutabile è cancellarlo e ricrearlo, riavviando poi ogni Pod che lo referenzia.

## Secure Configuration

Nonostante le caratteristiche dei Secret, è importante capire come gestirli e memorizzarli in sicurezza, per evitare che il loro contenuto sia visibile ad attori non autorizzati. In un approccio GitOps i Secret dovrebbero essere memorizzati cifrati nei repository Git, per poi essere decifrati nel loro processo di trasferimento verso il cluster Kubernetes. L'operazione di decifratura potrebbe avvenire a livello applicativo, ma richiederebbe del tempo per essere implementata. Esistono approcci più trasparenti e che ricadono principalmente in due categorie.

- *Out-of-cluster encryption*.
- *Centralized secret management*.

**Riferimenti**

- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Kubernetes Patterns - Reusable Elements for Designing Cloud Native Applications, Bilgin Ibryam and Roland Huß](https://www.oreilly.com/library/view/kubernetes-patterns/9781492050278/)