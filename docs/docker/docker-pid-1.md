# Processo PID 1 e tini

Il processo PID 1 riveste un ruolo importante nei sistemi operativi Linux. Tale processo è più comunemente noto come processo "init" e viene eseguito fin tanto che il sistema non viene spento. 

![Tree Processes](/img/tree_processes.png)

PID 1 gestisce i servizi Linux ed è la radice dell'alberatura dei processi. Questo processo riveste una particolare importanza in un container Docker, perchè il primo processo che viene avviato diventa automaticamente il PID 1:

```
docker run -it node:18 node
```

In questo caso Node.js diviene il PID 1 del container. Il processo PID 1 gestisce i segnali di terminazione diversamente dagli altri processi, che invece li ricevono di default e li gestiscono automaticamente (segnali come `SIGINT` da Ctrl+C, o `SIGTERM` da `docker stop`). PID 1 riceve i segnali, ma per alcuni segnali non applica l'azione predefinita se non è stato installato esplicitamente un handler. In aggiunta, il processo PID 1 ha anche il compito di dover gestire i processi figli che terminano e rimangono nello stato di *zombie*.

**_PROCESSO ZOMBIE_**: Un processo zombie e' un processo che ha terminato la sua esecuzione ma e' ancora presente nella tabella dei processi. Questo si verifica nei processi *figli* il cui *exit status* deve essere letto dal processo *padre*. Una volta che lo stato viene letto tramite la *system call* `wait`, il processo viene rimosso dalla tabella dei processi e si dice che e' stato "reciso" (*reaped*).

Nel caso in cui il processo PID 1 sia l'applicazione, i compiti descritti sopra non vengono assolti automaticamente, comportando un degrado delle prestazioni ed ottenendo un tempo di terminazione piu' lungo del container. Supponiamo che venga ricevuto il segnale `SIGTERM` dal processo PID 1 e che questo non lo propaghi perche' non sa come farlo (ad esempio, uno script bash non sa farlo naturalmente). Tuttavia, il processo PID 1 aspetta che i suoi processi *figli* terminino, evento che pero' non si verifica dato che non sanno di dover terminare. Dopo 10 secondi, Docker invia il segnale di `SIGKILL` al PID 1 e termina immediatamente. Il segnale di `SIGKILL` ordina al processo di terminare immediatamente senza effettuare alcun clean-up. Questo comportamento puo' avere un impatto ancora piu' tangibile in ambienti produttivi: su Kubernetes `SIGKILL` viene inviato dopo 30 secondi, rendendo ancora piu' lunga l'attesa per la terminazione. 

Per ovviare a questo problema esistono soluzioni come [**tini**](https://github.com/krallin/tini), un piccolo *init command* che gestisce la *signal propagation/forwarding* e la *zombie reaping*.

**Riferimenti**

- [PID 1 and tini in Docker: Why Your Container Ignores Ctrl+C](https://dev-aditya.medium.com/pid-1-and-tini-in-docker-why-your-container-ignores-ctrl-c-800b565cb76e)
- [How better management of processes in Docker can greatly improve a container’s lifecycle](https://www.theodo.com/blog/how-better-management-of-processes-in-docker-can-greatly-improve-a-containers-lifecycle)
- [Zombie process](https://en.wikipedia.org/wiki/Zombie_process)
- [How we reduced 502 errors by caring about PID 1 in Kubernetes](https://about.gitlab.com/blog/how-we-removed-all-502-errors-by-caring-about-pid-1-in-kubernetes/)