# Internal service discovery

La service discovery, nell'era di Kubernetes, è offerta dalla piattaforma e non è più una funzionalità che ricade sulle applicazioni, che richiederebbero un *registry* dedicato e l'implementazione di un *self registration pattern*. Tutto viene gestito da Kubernetes.

Un Pod, installato con più repliche, ad esempio gestite da un Deployment o da un ReplicaSet, possiede all'inzio solo un IP interno al cluster, che gli viene assegnato al momento della creazione. Pertanto, non è possibile conoscere in maniera semplice questo IP prima che un Pod venga istanziato. Kubernetes mette a disposizione la risorsa *Service* proprio per ovviare a questo problema. 

Il Service in Kubernetes fornisce un **punto di ingresso consistente e stabile per una collezione di Pod identificati da un *selector* comune** e che, in tal senso, offrono la stessa funzionalità. Un Service, creato a partire da un manifest - mediante `kubectl apply -f` - o con il comando `kubectl expose` crea un IP Virtuale al quale ci si riferisce con *ClusterIP* che consente di contattare i Pod, senza la necessità di conoscere il numero di repliche o i loro IP. 

> **Nota:** un Service Kubernetes effettua un bilanciamento Livello 4 (Trasporto) e non a Livello 7 (Applicativo).

Il service di tipo *ClusterIP* possiede una serie di caratteristiche che influenzano l'esposizione dei Pod.

- Un Service supporta più porte, ad esempio nel caso in cui una funzionalità sia disponibile sia in HTTP (es. sulla porta 8080) piuttosto che in HTTPS (es. porta 443).
- Consente di mantenere una sessione con un determinato Pod, specificando `sessionAffinity: ClientIP`. In questo modo le richieste provenienti da uno stesso client IP ricadranno sullo stesso Pod; senza questa opzione il traffico viene inviato ad uno qualsiasi dei Pod.
- Il Service tiene conto della *Readiness probe*: se questa fallisce per un Pod, questo viene rimosso dalla lista di endpoint del Service e non gli viene più inviato traffico.
- Il Service di tipo *Cluster IP* detiene un Virtual IP stabile, sebbene questo non corrisponda ad una vera e propria network interface. L'inoltro dei pacchetti verso i Pod avviene grazie alla modifica da parte del *kube-proxy* delle iptables dei nodi.


**Il clusterIP è il default *type* di Service ed è accessibile solo all'interno del cluster** e può essere facilmente recuperato dagli altri *workloads* presenti nel cluster, tramite due modalità: **environment variables discovery** e **DNS lookup discovery**.

## Environment variables discovery 

Ogni Pod al suo interno presenta delle variabili d'ambiente che vengono iniettate automaticamente da Kubernetes. Alcune di queste variabili contegono i dettagli dei Service che esistono fino a quel momento. L'individuazione della corrette variabili d'ambiente da utilizzare richiede la conoscenza del *Service name*: le variabili sono del tipo `<SERVICE-NAME>_SERVICE_HOST` e `<SERVICE-NAME>_SERVICE_PORT`, che foriscono rispettivamente IP e porta del servizio da contattare. Il problema di questo approccio è la **dipendenza temporale che si crea tra i Pod e il Service**: il Service, per essere noto ad un Pod, deve esistere prima che quel Pod venga creato; in caso contrario, il Pod deve essere riavviato per disporre delle nuove variabili d'ambiente.

## DNS lookup discovery

Kubernetes crea dei record sul proprio server DNS sia per i Service che per i Pod.

I Pod possono utilizzare il server DNS di Kubernetes per raggiungere il Service, sfruttando un *fully qualified domain name* definito secondo questo pattern `<SERVICE-NAME>.svc.<NAMESPACE>.<CLUSTER-DOMAIN>`, dove il `<CLUSTER-DOMAIN>` è specifico del cluster. Il suffisso del cluster e il namespace possono essere omessi se il Service è acceduto da un *workload* all'interno dello stesso namespace. Questa soluzione non soffre dello stesso vincolo temporale dell'approccio che sfrutta le variabili d'ambiente. Resta però necessario conoscere la porta, in casi di un'esposizione "non-standard", del servizio da contattare.

## EndpointSlices

Gli *EndpointSlice* rappresentano il meccanismo attraverso il quale Kubernetes mantiene aggiornate le informazioni sugli endpoint di rete associati ad un Service, gestendo in modo efficiente le applicazioni composte da un gran numero di Pod. 

I Pod in Kubernetes sono risorse effimere e possono essere soggetti a mutamenti: vengono creati, terminati o sostituiti in qualsiasi momento. Questi eventi causano anche una modifica dell'IP del Pod, che, senza l'impiego di una soluzione efficiente, sarebbe difficile da tracciare.

**Un *EndpointSlice* rappresenta un sottoinsieme degli endpoint di rete associati ad un Service con un *selector* specificato**. Gli *EndpointSlices*

- raggruppano gli endpoint su una combinazione di IP, protocollo, numero di porta e Service name;
- vengono gestiti dal control plane.

> **Nota: Endpoint vs EndpointSlices**. Gli Endpoint sono il metodo legacy con cui veniva tenuta traccia degli endpoint dei Service in Kubernetes. Gli **Endpoint** tenevano traccia di tutti gli IP e delle porte dei Pod che erano dietro un Service in **unico oggetto** Kubernetes. L'oggetto veniva poi aggiornato seguendo il ciclo di vita dei Pod coinvolti, gestendo fino ad un massimo di 1000 Pod. Gli **EndpointSlices**, in GA da Kubernetes 1.21, **risolvono il problema di scalabilità** degli Endpoint suddividendo i Pod in oggetti più piccoli (massimo 100 endpoint), raggruppati come detto secondo IP, numero di porta e Service name. In altre parole, Endpoint ed EndpointSlices hanno lo stesso scopo ma organizzano le informazioni in modo diverso. 

**Riferimenti**

- [Kubernetes Patterns - Reusable Elements for Designing Cloud Native Applications, Bilgin Ibryam and Roland Huß](https://www.oreilly.com/library/view/kubernetes-patterns/9781492050278/)
- [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
- [Endpoints and Endpoint Slices Overview](https://notes.kodekloud.com/docs/Kubernetes-Networking-Deep-Dive/Kubernetes-Services/Endpoints-and-Endpoint-Slices-Overview/page)