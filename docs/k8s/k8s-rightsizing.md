# Resource right-sizing in Kubernetes

Le informazioni di *requests* e *limits* determinano il consumo di memoria e CPU dei workloads in Kubernetes. Nel dettaglio

- Le *requests* indicano CPU e memoria da assegnare al container e influiscono su dove dovra' essere eseguito. Il *kube-scheduler* utilizza unicamente le richieste di risorse per decidere quale nodo puo' ospitare il pod: se le risorse del nodo disponibili non riescono a soddisfare quanto richiesto, lo scheduler non considera quel nodo. 

- I *limits* indicano quanto al massimo il container puo' consumare. I limits sono "invisibili" allo scheduler, in quanto non vengono tenuti in considerazione durante l'allocazione. I limits sono utilizzati solo quando il pod e' in esecuzione ed il loro superamento comporta un diverso comportamento di Kubernetes per la CPU e per la memoria. 
    - Nel caso in cui il limite di CPU viene superato, questa viene limitata (*CPU throttling*, in altre parole il kernel impedisce ai processi del container di continuare ad utilizzare la CPU del nodo).
    - Diversamente, se la memoria supera il limite, il pod viene terminato (*pod eviction*).

Allocare in modo adeguato le risorse non e' semplice, la maggior parte delle volte si tende a fare *overprovisioning*, semplicemente perche' fare *overprovisioning* e' considerato *safe*. Tuttavia, l'utilizzo di piu' risorse, sebbene consenta di ridurre nel caso della memoria la *pod eviction* e di conseguenza eventuali disservizi, richiede un costo.

I problemi legati al superamento del limite di memoria sono stati discussi [per la OOMKilled *Reason* nel caso di *exit code* 137](#exit-code-137--sigkill); il problema del superamento del limite della CPU e' diverso, dato che il pod non viene terminato. Un CPU limit di 500m, non equivale a consumare meta' della CPU a disposizione sul nodo, bensi' equivale, nel caso del periodo di default (100ms) del Linux CFS (Completely Fair Schedule), ad un limite massimo di utilizzo di CPU pari a 50ms ogni 100ms. Una volta che quella quota si e' esaurita il container viene sottoposto a *CPU throttling* fino al successivo periodo, nonostante il nodo possa ancora avere CPU disponibile. Pertanto, in caso di spike di traffico dove l'utilizzo della CPU si fa intenso ed il relativo limite viene raggiunto prima, non basta analizzare solo l'andamento della CPU del nodo (che potrebbe non trovarsi sotto pressione), ma bisogna correlare anche la l'andamento della *CPU throttling*.

```
Periodo CFS: 100 ms
Quota:        50 ms

0ms                         50ms                 100ms
|----------------------------|---------------------|
████████████████████████████ |                     |
        CPU utilizzata       |      THROTTLED
                             |
                             └─ quota esaurita
```

**Riferimenti**
- [Kubernetes Requests and Limits: How to Right-Size Pods Without Breaking Reliability](https://cast.ai/blog/kubernetes-requests-and-limits/)
