# CPU overcommit: somma dei limit superiore alla capacità del nodo

## Scenario

Cluster Kubernetes composto da un singolo nodo con:

```text
CPU disponibile: 1 core = 1000m
```

Vengono creati due pod:

| Pod | CPU request | CPU limit |
|---|---:|---:|
| Pod 1 | `500m` | `1000m` |
| Pod 2 | `500m` | `500m` |
| **Totale** | **`1000m`** | **`1500m`** |

# Domande

1. Kubernetes riesce a schedulare entrambi i pod, anche se la somma dei limit è superiore alla CPU del nodo?
2. Cosa accade al Pod 2 se il Pod 1 supera la propria request e arriva vicino al limit?

# Risposta breve

Sì, entrambi i pod possono essere schedulati, purché il nodo abbia almeno `1000m` di CPU **allocatable** ancora disponibile.

Kubernetes decide il posizionamento dei pod principalmente sulla base delle **request**, non della somma dei limit. È quindi possibile avere:

```text
Somma request <= capacità allocatable
Somma limit   > capacità allocatable
```

Questo comportamento prende il nome di **CPU overcommit**.

## Comportamento durante l'esecuzione

## Pod 2 inattivo

Se il Pod 2 non sta utilizzando CPU, il Pod 1 può sfruttare la capacità libera e arrivare fino al proprio limite:

```text
Pod 1: fino a 1000m
Pod 2: 0m
```

## Entrambi i pod richiedono CPU

Se entrambi diventano pienamente attivi, il nodo non può fornire i `1500m` complessivamente richiesti.

Poiché entrambi hanno una request di `500m`, ricevono un peso CPU equivalente. Sotto contesa, la CPU viene quindi distribuita indicativamente così:

```text
Pod 1: circa 500m
Pod 2: circa 500m
```

Il Pod 1 può utilizzare CPU oltre la propria request solamente quando esiste capacità inutilizzata. Non può continuare a consumare `1000m` mentre il Pod 2 necessita della sua quota.

La distribuzione non è necessariamente precisa al millisecondo: le request determinano il **peso relativo** assegnato ai pod dal sistema operativo.

## Effetto dei limit

- Il Pod 1 non può superare `1000m`.
- Il Pod 2 non può superare `500m`, neppure quando il Pod 1 è inattivo.
- Quando un container raggiunge il proprio CPU limit, viene applicato il **CPU throttling**.
- In caso di contesa, i processi vengono rallentati; normalmente i pod non vengono terminati.

La CPU è infatti una risorsa **comprimibile**, a differenza della memoria, il cui esaurimento può causare un `OOMKilled`.

## Possibili risultati

| Domanda CPU Pod 1 | Domanda CPU Pod 2 | Utilizzo effettivo indicativo |
|---:|---:|---|
| `1000m` | `0m` | Pod 1: `1000m`, Pod 2: `0m` |
| `1000m` | `500m` | Pod 1: circa `500m`, Pod 2: circa `500m` |
| `700m` | `200m` | Pod 1: `700m`, Pod 2: `200m` |
| `200m` | `800m` | Pod 1: `200m`, Pod 2: massimo `500m` |

## Attenzione alla CPU allocatable

Un nodo con una CPU non mette necessariamente tutti i `1000m` a disposizione dei pod.

Una parte può essere riservata a:

- sistema operativo;
- kubelet e container runtime;
- componenti Kubernetes;
- eventuali configurazioni `systemReserved` e `kubeReserved`;
- altri pod già presenti sul nodo.

Se il nodo avesse, per esempio, solamente `900m` allocatable, il secondo pod potrebbe essere creato ma resterebbe in stato `Pending`:

```text
FailedScheduling: Insufficient cpu
```

## Principio da ricordare

> Le CPU request determinano se un pod può essere schedulato e il suo peso durante la contesa. Il CPU limit stabilisce invece il consumo massimo. Un pod può superare la propria request solamente sfruttando CPU momentaneamente inutilizzata.