# QoS classes

La *Quality of Service (QoS) class* viene attribuita ad un pod a seconda dei vincoli sulle risorse che sono imposti al container del pod. La QoS viene utilizzata per decidere una strategia di *pod eviction* nel caso in cui le risorse del nodo si stiano esaurendo. Le *QoS class* disponibili sono tre: *BestEffort*, *Burstable* e *Guaranteed*; Kubernetes, nel caso di *pod eviction*, segue un preciso ordine: prima rimuove tutti i pod con classe *BestEffort*, successivamente elimina i *Burstable* e per gli ultimi i pod con classe *Guaranteed*. 

## Classe `Guaranteed`

## Classe `Burstable`

## Classe `BestEffort`

**Riferimenti**

- [Pod Quality of Service Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)

## eBPF
