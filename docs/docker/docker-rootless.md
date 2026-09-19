# Rootless containers

> La modailita' *rootless* in Docker consente di eseguire il *daemon* e i container senza essere root, mitigando potenziali vulnerabilita'.

Ciascun comando che viene eseguito, come `docker run`, `docker build`, `docker pull`, e' una istruzione client che viene inviata ad un servizio Linux in background denominato `dockerd`. `dockerd` viene eseguito come root, si preoccupa di gestire ed eseguire container e immagini. L'esecuzione di questo processo con massimi privilegi apre a possibili scenari di attacco in cui un altro processo, in grado di comunicare con quella socket, può impartirgli istruzioni per eseguire operazioni come root.

### Podman

> Podman e' un container engine *daemonless*: la CLI invoca direttamente il runtime e i processi necessari per creare/eseguire il container, senza un *daemon* centrale persistente analogo a `dockerd`.

**Riferimenti**

- [Rootless mode](https://docs.docker.com/engine/security/rootless/)
- [Docker vs Podman in 2026: Is Docker Still Worth It?](https://medium.com/@surbhi19/is-docker-still-worth-it-in-2026-or-should-you-switch-to-podman-29d89b42dc80)