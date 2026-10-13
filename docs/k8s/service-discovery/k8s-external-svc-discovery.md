# External service discovery

Il concetto di service discovery esterno include la raggiungibilità di workload esterni dall'interno del cluster, ma anche il flusso inverso, ovvero la possibilità di contattare le applicazioni all'interno del cluster dall'esterno.

## Connessioni verso IP esterni: *manual service discovery*

Come visto per la *internal service discovery* Kubernetes individua automaticamente gli endpoint dei Pod da esporre con il Service, grazie all'utilizzo del selettore. Tuttavia, invece di utilizzare come backend i Pod del cluster, è possibile ridirezionare il traffico verso IP e porte esterne pur mantenedo il *service type* uguale a *ClusterIP*. Per fare questo è sufficiente omettere il selettore dalla definizione del Service e definire una risorsa Endpoint (o per le versioni più recenti di Kubernetes, un EndpointSlice) con l'IP esterno. Dunque, i workload possono usare il nome di questo Service, accessibile solo dall'interno del cluster, per invocare servizi esterni.

Esiste un altro modo di esporre servizi all'interno del cluster, utilizzando il *service type ExternalName*. Questo tipo di Service, come il precedente, non necessita del selector ma il modo in cui viene realizzato il puntamento verso il servizio esterno è diverso; in particolare, il FQDN del Service tradurrà quanto contenuto in *externalName*:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: prod
spec:
  type: ExternalName
  externalName: my.database.example.com
```
Si tratta di un modo per utilizzare un alias verso un endpoint esterno, creando un record DNS CNAME invece di sfruttare il Service come proxy verso un IP esterno.

## Discovery fuori dal cluster

In un cluster Kubernetes la comunicazione non avviene solo dall'interno verso l'esterno, ma spesso è un client esterno che vuole raggiungere i Pod per utilizzare le funzionalità esposte. La prima modalità per esporre un servizio fuori dal cluster è creare un Service di tipo *NodePort*. La tipologia *NodePort* consente di raggiungere il VirtualIP del Service attraverso una porta dedicata su ogni nodo del cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: NodePort
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - port: 80
      # By default and for convenience, the `targetPort` is set to
      # the same value as the `port` field.
      targetPort: 80
      # Optional field
      # By default and for convenience, the Kubernetes control plane
      # will allocate a port from a range (default: 30000-32767)
      nodePort: 30007
```

Questa tipologia di Service ha delle caratteristiche particolari. 

Dapprima, la connessione verso un nodo *healthy* è sotto la responsabilità del client che, nel caso in cui un nodo dovesse essere indisponibile, dovrà indirizzare la connessione verso un nodo funzionante. 

In aggiunta, il modo con cui il traffico viene inoltrato ai Pod che espongono la funzionalità dipende dalla *externalTrafficPolicy* che può essere impostata a *Local* oppure a *Cluster*. 

In caso di *Local*, Kubernetes non consente la connessione a Pod che sono presenti su nodi diversi da quello contattato. In altre parole, se il client si connette ad un nodo su cui non è presente uno dei Pod che offre la funzionalità richiesta, l'endpoint non viene raggiunto. Per mitigare questo comportamento, si può sfruttare il *DaemonSet* ed eseguire un Pod su ciascun nodo oppure impostare la *externalTrafficPolicy* a *Cluster*.

L'utilizzo di *Local* o *Cluster* non ha effetto solo sull'instradamento del traffico, ma anche sulla conservazione dell'IP sorgente. Nel caso di *Local* l'IP sorgente viene conservato, mentre il comportamento con *Cluster* - che rappresenta il default - prevede il *source NAT*. In questo caso, l'IP della sorgente viene sostituito con l'indirizzo interno del nodo che viene contattato.

**Riferimenti**

- [Kubernetes Patterns - Reusable Elements for Designing Cloud Native Applications, Bilgin Ibryam and Roland Huß](https://www.oreilly.com/library/view/kubernetes-patterns/9781492050278/)
- [Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/#externalname)