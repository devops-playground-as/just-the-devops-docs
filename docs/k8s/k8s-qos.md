# QoS classes

La *Quality of Service (QoS) class* viene attribuita ad un pod come conseguenza dei vincoli sulle risorse imposti ai container del pod. La QoS viene utilizzata per decidere la strategia di *pod eviction* nel caso in cui le risorse del nodo si stiano esaurendo. Le *QoS class* disponibili sono tre: *BestEffort*, *Burstable* e *Guaranteed*; Kubernetes, nel caso di *pod eviction*, segue un preciso ordine: prima rimuove tutti i pod con classe *BestEffort*, successivamente elimina i *Burstable* e per gli ultimi i pod con classe *Guaranteed*. 

## Classe `Guaranteed`

I pod che hanno la classe *Guaranteed* hanno la limitazione piu' stringente sulle risorse e sono **gli ultimi che dovranno affrontare una *eviction***. Per questi pod c'e' la garanzia di non essere eliminati a meno che non superino i limiti impostati o che non ci siano piu' pod con priorita' piu' bassa (*lower priority pods*) da rimuovere dal nodo. 

Le condizioni affinche' Kubernetes assegni la classe *Guaranted* ad un pod sono le seguenti.

- Ogni container nel pod deve avere i valori di *request* e *limit* impostati e maggiori di zero, sia per la CPU che per la memoria.
- Per ogni container nel pod deve la *memory request* uguale alla *memory limit*.
- Per ogni container nel pod deve la *CPU request* uguale alla *CPU limit*.

Se le risorse vengono definite a livello di pod (*pod-level resources*), allora valgono le seguenti condizioni.

- Il pod deve avere *memory request* e *memory limit* maggiori di zero e uguali fra loro. 
- Il pod deve avere *CPU request* e *CPU limit* maggiori di zero e uguali fra loro. 

## Classe `Burstable`

Un pod rientra in questa classe quando per i suoi container viene specificato solo un *lower bound* di risorse disponibili; in altre parole, e' necessario che sia indicata solo la *request* senza specificare necessariamente il limit. Questa condizione consente al pod di ottenere, in maniera flessibile, sempre piu' risorse se ne dovesse avere bisogno e se sono disponibili. I pod con classe *Burstable* vengono rimossi solo dopo i *BestEffort* pod.

Le condizioni affinche' Kubernetes assegni la classe *Burstable* ad un pod sono le seguenti.

- Il pod non soddisfa i criteri di *Guaranteed*.
- **Almeno un container** deve specificare la *request* (di memoria o di CPU) **o** il *limit* (di memoria o di CPU); nel caso di *pod-level resources*, il pod deve specificare almeno un valore tra *request* o *limit*, per la CPU o per la memoria. 

## Classe `BestEffort`

Un pod in questa classe puo' usare le risorse del nodo che non sono state assegnate ai pod nelle altre classi. In questo caso, i pod con classe *Burstable* non rispettano i criteri di *Guaranteed* e di *Burstable*, dunque i container non hanno dichiarati *request* e *limit* per memoria e CPU. Tali pod sono quelli che vengono eliminati per primi nel caso di *node pressure*.

> **Nota:** ci sono alcuni aspetti particolare da considerare relativamente alle classi QoS e alla gestione delle risorse di un po. 
>  - La quantita' di risorse richieste di un pod deve equivalere alla somma delle risorse richieste dei container che lo compongono, cosi' come il limite deve essere uguale alla somma dei *limit*.
> - Il kube-scheduler non considera la classe QoS quando deve selezionare i pod per cui fare *preemption* (ovvero, l'operazione che rimuove i pod con bassa priorita' da un nodo, al fine di allocare un pod per il quale non esistono nodi che ne soddisfano i requisiti di risorse).
> - La classe QoS viene determinata alla creazione del pod e viene mantenuta per tutta la vita del pod; se si cerca di fare un *update in-place* delle risorse che porta il pod da una *QoS class* ad un'altra, questa modifica e' respinta dall'[*admission controller*](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/).


**Riferimenti**

- [Pod Quality of Service Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)