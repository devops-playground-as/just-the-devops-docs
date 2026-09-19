# Exit Codes

A seguito del un fallimento di un pod, passato presumibilmente in uno stato `CrashLoopBackOff` e con il numero di restart che aumenta, è importante determinare cosa ha determinato questa situazione. Bisogna chiedersi con quale *exit code* è fallito il pod? **Gli *exit codes* sono numeri interi che sono restituiti a seguito della terminazione di un processo del un container e contengono informazioni su tale terminazione.** Gli *exit code* 

- vanno da 0 a 255, dove `0` indica una terminazione senza errori
- i segnali superiori a 128 indicano che il processo è stato terminato da un segnale del sistema operativo (*OS signal*)
- i segnali superiori a 128 seguono lo standard POSIX e si usa generalmente la formula `128 + numero del segnale`. Ad esempio `137 = 128 + 9`, dove `signal 9 = SIGKILL (9)`, `139 = 128 + 11` dove `signal 11 = SIGSEGV (11)`, `143 = 128 + 15` dove `signal 15 = SIGTERM (15)`.

Il container runtime di Kubernetes memorizza il codice di errore e lo mostra a seguito dell'esecuzione del comando `kubectl describe pod <nome-pod>`, nella sezione *Last State > Exit Code*, e nell'oggetto `lastState.terminated` presente nel pod `spec`. L'ulteriore campo `Reason` consente di capire se Kubernetes ha azionato la terminazione, a seguito di qualche evento, oppure se il processo è terminato autonomamente.

### Ciclo per la diagnosi del codice di errore

Un ciclo di azioni per l'identificazione e il superamento della terminazione a seguito di un determinato codice di errore prevede le seguenti fasi **_Identify, Classify, Fix, Prevent_**.

- *Identify*. Identificare il pod e il container oggetto del fallimento.
- *Classify*. Classificare il motivo del fallimento individuando (*Exit Code* e *Reason*) sfruttando il comando di `kubectl describe`.
- *Fix*. Determinare come risolvere riccorrendo a log ed eventi.
- *Prevent*. Prevenire un nuovo verificarsi dell'errore indirizzando la *root cause*.

I comandi riportati di seguito sono utili per l'esecuzione delle fasi previste dal ciclo.

```bash 
kubectl get pods -n <namespace>
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --previous
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

*Exit code*, *Reason*, log ed eventi devono essere essere combinati per rendere più completa l'analisi: il solo codice non identifica sempre la causa.

### Exit code principali

Di seguito sono riportati gli *exit code* principali, ciascuno con una rapida descrizione. Tali codici sono riepilogati nella seguente tabella di riferimento.

| Codice | Significato |
|---:|---|
| `0` | Terminazione corretta |
| `1` | Errore generico |
| `125` | Errore del container runtime |
| `126` | Comando non eseguibile |
| `127` | Comando non trovato |
| `137` | `SIGKILL`: OOMKilled, grace period scaduto o arresto forzato |
| `139` | `SIGSEGV`: accesso non valido alla memoria |
| `143` | `SIGTERM`: richiesta di terminazione graceful |
| `255` | Errore grave dell’applicazione o dell’infrastruttura |


### Exit code 137 — `SIGKILL`

Il processo viene terminato forzatamente senza poter eseguire cleanup a seguito dell'invio, da parte del OOM Killer del kernel, di un SIGKILL. Una delle cause più comuni per cui tale evento si verifica prevede che il container stia richiedendo un quantitativo di memoria **superiore al limite del cgroup** impostato da Kubernetes. Dato che non c'è alcun tipo di avviso, il processo viene terminato nel bel mezzo della sua esecuzione.

![OOMKilled](/img/k8s/oomkilled.png)

La *Reason* presente nell'immagine viene impostata da Kubernetes e non dall'applicazione. **L'evento di *OOMKill* apparte anche nei kernel log del nodo**.

> **Nota**: nel caso di cluster gestito, in cui i nodi non sono direttamente accessibili è possibile utilizzare il comando `kubectl debug node/<node-name>`.

Tuttavia, il codice 137 non è sempre determinato dal *OOM Killer* del kernel; infatti, due modalità di fallimento possono produrre questo codice di errore. Il campo *Reason* può fornire un'indicazione in più.

- 137 con `Reason: OOMKilled`: il container ha superato il limite di memoria, in questo caso la fix prevede un innalzamento del limite di memoria o l'impiego di meccanismi di scaling automatico.
- 137 con `Reason: Error`: è probabilmente scaduto `terminationGracePeriodSeconds` prima che il container abbia terminato lo *shutdown*. In questo caso la fix prevede un aumento del `terminationGracePeriodSeconds`.

Come buona norma, va controllato sempre il campo `Reason`, i consumi di memoria ed i limiti configurati; se la memoria cresce continuamente, nonostante gli aumenti, potrebbe esserci un memory leak: aumentare il limite ritarderebbe il problema, estendendo soltanto il tempo tra una terminazione e l'altra. Ad esempio, nel caso di applicazioni Java, i parametri per l'allocazione della memoria della JVM vanno opportunemente impostati: se `-Xmx` viene posto uguale al limite di memoria del container, non si sta considerando la richiesta di memoria delle operazioni che non riguardano la *heap space allocation*.

> **Nota**: per le applicazioni Java la *rule of thumb* prevede di impostare `Xmx` a `container_limit * 0.75`.

Il consumo eccessivo di memoria da parte del container non è la sola causa del codice 137, pur trattandosi di una delle più comuni. Possono verificarsi due ulteriori scenari.

- **_Node memory pressure e kubelet eviction_**. Il *kubelet* monitora la memoria del nodo rispettando degli *eviction threshold* (di default memoria disponibile sotto i `100Mi`). Nel caso in cui il nodo stia progressivamente esaurendo la sua memoria, *kubelet* procede con la *eviction* dei pod, secondo la *QoS class*: prima i *BestEffort*, poi i *Brustable*. Questo evento è diverso da un *OOMKill* per i seguenti motivi:
    - la kill non viene effettuata dal *OOMKiller* ma da *kubelet*
    - la *Reason* del `describe` è *Evicted* e non *OOMKilled*
    - lo stato del pod rimane *Failed* finchè non viene cancellato.

- **_Node level OOM (container sotto il proprio limite)_**. Nel caso in cui la *kubelet eviction* dei pod non procede abbastanza velocemente, il *OOM Killer* del kernel può lanciare la terminazione a livello di nodo. In questo caso, un container può essere terminato anche se non ha richiesto più memoria del suo *cgroup limit*, era semplicemente il candidato con la *OOM priority* piu' bassa calcolata dal Kernel. Lo scenario in questione è molto simile a quando avviene il superamento del *memory limit*, ma si può discriminare cercando nel `syslog` del nodo, utilizzando il comando `grep "Out of memory: Killed process" /var/log/syslog`; se il risultato non contiene `memcg`, allora si tratta di un OOM a livello di nodo e non per il superamento del `limit` di memoria.  

> **Nota:** dalle versioni di Kubernetes successive alla 1.33, è presente la funzionalità di **In-Place Pod Resizing** che consente di aumentare le risorse di un pod senza un restart, a differenza di quanto avviene per la *Vertical Pod Autoscaling (VPA)*. Questa funzionalità è importante per i *workloads stateful*.

### Exit code 139 — `SIGSEGV`

L'errore 139 (128 + 11, dove 11 corrisponde a `SIGSEGV`, *segmentation fault*) indica un accesso non valido alla memoria, spesso causato da:

- puntatori nulli o buffer overflow in C/C++;
- librerie native incompatibili;
- estensioni Python come NumPy o TensorFlow;
- differenze di architettura o dipendenze mancanti.

In questo caso, effettuare la `describe` del pod non fornisce molte indicazioni, in quanto la *Reason* è semplicemente `Error`, trattandosi di un errore applicativo.

I log possono essere vuoti (e questa assenza può già essere una guida nel *troubleshoting*). Per approfondire si possono usare AddressSanitizer, debugger o `faulthandler` di Python.

### Exit code 143 — `SIGTERM`

Il codice di uscita 143, 128 + 15 (`SIGTERM`), si verifica quando Kubernetes richiede al container di terminare durante rollout, scale-down, drain del nodo o a causa di una eliminazione manuale del pod (`kubectl delete pod`).L’applicazione deve intercettare `SIGTERM`, completare le richieste in corso e chiudere correttamente le risorse. 

Questo è il comportamento previsto, che però può non verificarsi se l'uscita lascia in sospeso alcune attività che l'applicazione stava effettuando (es. *drop* delle connessioni aperte con il database). In altre parole, l'applicazione non riesce a terminare correttamente; inoltre, se la terminazione supera il `terminationGracePeriodSeconds`, che prevede una durata di 30s di default, **Kubernetes invia il segnale `SIGKILL` e l'*exit code* diventa 137**. I passi che costituiscono terminazione di un pod sono i seguenti:

- il pod viene rimosso dagli Endpoint del Service
- viene eseguito il `preStop` se definito
- viene inviato il segnale `SIGTERM` ed il pod ha il `terminationGracePeriodSeconds` per terminare
- superato il `terminationGracePeriodSeconds`, viene inviato il `SIGKILL`.

Solitamente, l'errore più noto che causa il passaggio dal `SIGTERM` al `SIGKILL` è legato ad una mancata gestione dei segnali di terminazione da parte del processo padre del container (PID 1). Ad esempio, questo si verifica quando l'applicazione viene eseguita all'interno di una *shell* (tramite utilizzo esplicito della shell, `ENTRYPOINT ["sh", "-c", "./myapp"]`, o ricorrendo alla *shell form*, `ENTRYPOINT ./myapp`). In questo caso, la shell, che riveste il ruolo di processo padre, non inoltra i segnali di uscita ai processi figli. L'utilizzo della *exec form* è preferibile nel Dockerfile:

```dockerfile
CMD ["./myapp"]
```

Tuttavia l'invio del `SIGKILL` da parte di Kubernetes, si può verificare se lo shutdown richiede più tempo del  `terminationGracePeriodSeconds` di default. Nel caso in cui questo si verifichi, si può aumentare il `terminationGracePeriodSeconds`.

### Exit code 127 — comando non trovato

L'*exit code* 127 non rientra tra quelli *signal-based*, ma indica che il comando definito in `CMD` o `ENTRYPOINT` non esiste nel percorso specificato.

Cause comuni:

- percorso errato;
- binario assente nell’immagine;
- passaggio a una *base image* diversa, ad esempio da Ubuntu ad Alpine;
- script che richiede Bash quando è disponibile soltanto `sh`.

In questo caso la diagnosi prevede l'ispezione dei log del container che e' terminato, utilizzando `kubectl logs <pod> -n <namespace> --previous`.


### Il ruolo del *fine-tuning* per gli *exit code*

Come visto dalla natura degli *exit code*, non tutti sono causati da un bug applicativo. Il 137, nel caso di *OOMKilled* ed in assenza di *memory leakage*, fornisce evidenza di un problema di natura strutturale: il limite di memoria fissato in fase di *deployment* non e' piu' sufficiente per il workload e va effettuato un nuovo dimensionamento. Come detto in precedenza, il VPA  puo' aiutare aggiornando i *requests* e *limits* delle risorse del pod, effettuandone pero' un restart nel caso di `updateMode` uguale a `Recreate` o `InPlaceOrRecreate`. Per queste due modalita' **e' buona norma tenere in considerazione la disponibilita' delle repliche del pod ed eventualmente abbinare il VPA ad un PodDistruptionBudget (con `minAvailable: 1`)**: il caso limite si ha nel caso di un Deployment con una sola replica, che verra' rimossa e ricreata causando un periodo di disservizio. Il VPA puo' anche essere utilizzato con `updateMode: Off`, fornendo cosi' solo delle raccomandazione senza applicarle.

La casistica di *exit code* 143/137 anche non e' legata necessariamente ad un problema applicativo, piuttosto prevede un corretto *fine-tuning* del `terminationGracePeriodSeconds` per assecondare il naturale *shutdown time* del workload.

**Riferimenti**

- [Kubernetes Exit Codes Explained: 137, 139, 143 and How to Fix Them](https://cast.ai/blog/kubernetes-exit-codes/)
- [OOMKilled and Exit Code 137: Why Kubernetes Kills Your Pods and How to Stop It](https://cast.ai/blog/oomkilled-exit-code-137/)
- [Pod Disruption Budget](https://kubernetes.io/docs/tasks/run-application/configure-pdb/)
- [Vertical Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/vertical-pod-autoscale/)