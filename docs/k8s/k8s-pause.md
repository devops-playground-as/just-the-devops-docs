# Pause Container

Ciascun pod in Kubernetes ha associato un *pause container*, al quale ci si riferisce spesso con *Infrastructure* o *Sandbox* container. Kubernetes lancia questo container ancor prima di creare il pod.

Il pause container di un pod si occupa di predisporre un ambiente condiviso per tutti i container che girano su quel pod, indipendentemente se siano uno o molteplici. Più precisamente, il pause container crea e detiene i Linux namespace utilizzati dal pod. I **Linux namespace sono una tecnologia essenziale per garantire l'isolamento delle risorse** e, allo startup, il pause container richiede queste risorse. In particolare

- **Network namespace**. Prende l'IP del pod e il network stack, consentendo agli altri container nel pod di condividere lo stesso indirizzo e le stesse porte; quando i nuovi container vengono avviati, condividono il network namespace del pause container a cui viene assegnato per primo. 

- **IPC namespace** e **UTS (UNIX Time-Sharing System) namespace**. Consente ai container di comunicare con meccanismi *inter-process* e garantice che i container abbiano lo stesso namespace.

- PID namespace. Opzionale, ma quando abilitato il pause container detiene il ruolo di PID 1 (processo padre, *init process*), gestendo eventuali processi zombi e fungendo da *init* per tutti i container nel pod. 

In altre parole, avere un container che fa il *boot* per primo e predispone questi namespace, consente che tutti i container nel pod possano utilizzarli e comportarsi come fossero processi sullo stesso host. **Il pause container, sebbene non faccia nulla la maggior parte del tempo, è essenziale perchè il pod funzioni**. Questo minimalismo risulta essenziale, riducendo la probabilità che il pause container esca o vada in crash; se il pause container termina, Kubernetes, rispettando la *restart policy* del pod, potrebbe ricreare da zero il pod.

**Riferimenti**

- [Understanding the Kubernetes Pause Container: The Pod's Hidden Hero](https://diveinto.com/blog/kubernetes-pause-container)