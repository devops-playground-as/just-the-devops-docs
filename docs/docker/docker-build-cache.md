# Docker build cache
**References**
- [Docker build cache](https://docs.docker.com/build/cache/)

Quando viene fatta la build di un'immagine Docker diverse volte, trovare il modo per ottimizzare la build cache è un ottimo modo per assicurarsi che le immagini vengano buildate velocemente.

Ciascuna istruzione in un Dockerfile corrisponde ad un **layer** nell'immagine Docker finale. Dunque, è possibile pensare un'immagine Docker come uno stack, dove ciascun layer aggiunge un contenuto in più rispetto al precedente.
![Docker layers](/img/docker_image_layers.png)
Tuttavia, quando un layer subisce una modifica, quel layer deve passare per una nuova build. In altre parole, Docker deve invalidare la cache per quel layer. Un cambiamento di un layer, condiziona anche tutti i layer successivi. Di conseguenza, anche tutti i layer successivi devono essere eseguiti di nuovo.
![Docker layers](/img/docker_image_layers_rebuild.png)

## Ottimizzare l'uso della cache nelle build
**References**
- [Optimize cache usage in builds](https://docs.docker.com/build/cache/optimize/)

Come detto in precedenza, durante una build con Docker, un layer è riutilizzato dalla cache se le istruizioni e i file da cui dipende non hanno subito una modifica dalla build precedente. Ci sono alcune best practices che consentono di ottimizzare l'utilizzo della cache e velocizzare il processo di build.

### Ordinare i layer
I comandi in un Dockerfile devono essere disposti secondo un ordine logico, evitando di invalidare la cache. Come regola generale, **gli step più onerosi vanno inseriti all'inizio del Dockerfile**, mentre i **comandi che cambiano con più frequenza, devono appararire alla fine del Dockerfile**, per evitare di azionare di nuovo la build di layers che non sono cambiati.

Nella porzione di Dockerfile riportata di seguito si può notare come l'istruzione di installazione delle dipendenze segua il comando di `COPY`. In questo modo, **l'installazione delle dipendenze verrà avviata anche se queste non sono cambiate, ma sarà azionata da un update di un qualsiasi file nel progetto**.

```docker
# syntax=docker/dockerfile:1
FROM node
WORKDIR /app
COPY . .          # Copy over all files in the current directory
RUN npm install   # Install dependencies
RUN npm build     # Run build
```

Il comando di `COPY` può essere divisio in due. Prima si possono copiare i package management files (in questo caso yarn.lock, package.json). **Successivamente, si installano le dipendenze ed infine viene copiato il codice sorgente del progetto, che è soggetto frequentemente a modifiche**.

```docker
# syntax=docker/dockerfile:1
FROM node
WORKDIR /app
COPY package.json yarn.lock .          
RUN npm install   # Install dependencies
COPY . .
RUN npm build
```

### Keep the context small
Questa best practice prevede di non includere per errore all'interno di un'immagine file non necessari. A tal fine, si può ricorrere al `.dockerignore` che funziona come un `.gitignore`, consentendo di escludere i file e le directory fuori dal contesto di build.

### Utilizzo di bind mounts
Il bind mount consente di montare un file o una cartella dalla macchina host all'interno del container. Il bind mount può essere utilizzato all'interno di un comando di `RUN` per rendere disponibili dei file unicamente in quel punto.

```docker
FROM golang:latest
WORKDIR /app
RUN --mount=type=bind,target=. go build -o /app/hello
```
In questo esempio, la directory corrente viene montata prima che il comando di `go build` venga eseguito. I file sono disponibili per tutta la durata dell'esecuzione del comando di `RUN`; quando l'istruzione termina, i file non verranno mantenuti nell'immagine finale o nella build cache. Nell'immagine rimmarrà solo l'output del comando del `go build`.

A differenza delle istruzioni di `COPY` e `ADD` che aggiungono file all'immagine costruita, l'utilizzo di bind mount ottimizza la build cache evitando di aggiungere layers non necessari; ad esempio, se alcuni file particolarmente grandi vengono usati solo per generare un artefatto, conviene ricorrere al bind mount anzichè includerli nell'immagine. In merito al bind mount, ci sono alcuni punti di attenzione.

- I bind mount sono in sola lettura; se i file devono essere modificati è necessario specificare la modalità `rw`. In ogni caso, le modifiche sui file non persistono e vengono rimosse al termine del comando di `RUN`.

- Solo l'output del comando di `RUN` rimane nell'immagine.

- Se la directory target non è vuota - ovvero se sono stati già aggiunti/creati file nei layer precedenti dell'immagine - il suo contenuto verrà nascosto dal bind mount nel comando di `RUN`. Il contenuto è ripristinato al termine del comando. Un esempio di questo comportamento è mostrato di seguito.

  Si supponga di avere solo il Dockerfile nel build context.

  ```plaintext
  .
  Dockerfile
  ```

  Il Dockerfile ha il seguente contenuto

  ```docker
  FROM alpine:latest
  WORKDIR /work
  RUN touch foo.txt
  RUN --mount=type=bind,target=. ls
  RUN ls
  ```

  I due comandi `ls` avranno output differenti, il primo mostrerà il Dockerfile, mentre il secondo mostrerà il file creato `foo.txt`.

  ```plaintext {title="Build log"}
  #8 [stage-0 3/5] RUN touch foo.txt
  #8 DONE 0.1s
  
  #9 [stage-0 4/5] RUN --mount=target=. ls -1
  #9 0.040 Dockerfile
  #9 DONE 0.0s
  
  #10 [stage-0 5/5] RUN ls -1
  #10 0.046 foo.txt
  #10 DONE 0.1s
  ```

### Utilizzo di cache mounts
I layer di cache regolari in Docker corrispondono a un match esatto tra l’istruzione (`RUN`, `COPY`, ecc.) e i file da cui essa dipende.

Se l’istruzione o uno qualsiasi dei file sorgenti cambia rispetto alla build precedente, il layer viene invalidato e deve essere ricostruito da zero.
In caso contrario, Docker riutilizza il layer già presente nella cache dell’immagine.

La cache mount è un meccanismo introdotto da BuildKit che consente di definire directory di cache persistenti e cumulative tra build diverse. Serve a ottimizzare operazioni ripetitive durante la costruzione dell’immagine (come npm install, pip install, ecc.), evitando di riscaricare o ricompilare dipendenze che non sono cambiate.

In altre parole, **anche se un layer viene invalidato e ricostruito, i file memorizzati nella cache mount vengono riutilizzati, permettendo di scaricare solo ciò che è effettivamente nuovo o modificato**. Così come per il bind mount, per utilizzare la cache mount si può utilizzare il flag `--mount` nell'istruzione `RUN`.

```dockerfile
FROM node:latest
WORKDIR /app
RUN --mount=type=cache,target=/root/.npm npm install
```

In questo esempio, il comando `npm install` utilizza una cache mount per la directory `/root/.npm`, la location di default per la cache npm. La cache mount è persistente tra le build, quindi anche se il layer è oggetto di diverse build, vegnono scaricati sono i nuovi package o che sono cambiati. Tutti i cambiamenti alla cache rimangono, in quanto è condivisa tra le varie build.

Le cache mount non fanno parte dell’immagine finale: vengono montate solo durante la fase di build e poi memorizzate nel sistema di cache di BuildKit (es. /var/lib/buildkit). Non toccano la cache dell’host (~/.npm, ~/.cache, ecc.).

In Kubernetes, se BuildKit gira in un Pod, la cache viene memorizzata nel volume montato dal Pod (es. emptyDir o PersistentVolumeClaim).

### Cache esterna
La cache per le build viene memorizzata di default all'interno del builder - l'instanza di BuildKit - che si sta utilizzando. Ciascun builder utilizza la cache che ha memorizzato, quindi se si cambiano diversi builder, la cache non viene condivisa. **Utilizzare una cache remota consente di poter definire una location remota dove inserire ed ottenere dati**.

**La cache esterna è particolarmente utile per le pipeline di CI/CD, dove i builder sono spesso effimeri ed i minuti di build sono preziosi**. Riutilizzare la cache tra le build può aumentare notevolmente la velocità del processo. Per utilizzare una cache esterna, bisogna specificare i flag `--cache-to` e `--cache-from` con il comando `docker buildx build`, rispettivamente per esportare i file verso la cache e specificare la cache remota da utilizzare.

L'esempio di seguito mostra un GitHub action workflow che utilizza `docker/build-push-action`. 

```yaml
name: ci

on:
  push:

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          push: true
          tags: user/app:latest
          cache-from: type=registry,ref=user/app:buildcache
          cache-to: type=registry,ref=user/app:buildcache,mode=max
```