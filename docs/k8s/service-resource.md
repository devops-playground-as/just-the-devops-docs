# Service Resource

## External Traffic Policy

Il valore di `externalTrafficPolicy` controlla come viene instradato il traffico proveniente dall'esterno. I due valori validi sono `Cluster` e `Local`, il primo consente il routing del traffico esterno verso tutti gli endpoint attivi, mentre il secondo instrada il traffico solo verso gli endpoint locali ai nodi. 

Nel caso di `Local` e di assenza di endpoint locali, il kube-proxy non inoltrerà il traffico ai Service destinatari. **Il kube-proxy ritornerà 200 solo se è attivo e se esiste un local endpoint sul nodo in questione**. La cancellazione di nodi non ha impatto sul codice di ritorno del kube-proxy, relativamente agli health checks dei load balancer. In altre parole, kube-proxy continua a rispondere con successo ai load balancer, anche se un nodo è marcato come *deleted* nel cluster. Cancellare un nodo può creare una indisponibilità di ingress solo per gli endpoint che sono su quel nodo.