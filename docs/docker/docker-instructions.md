# Istruzioni di un Dockerfile

**References**
- [Dockerfile instructions](https://docs.docker.com/build/building/best-practices/#dockerfile-instructions)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)

Di seguito sono riportate le istruzioni da poter inserire in un Dockerfile.

- `FROM`. Definisce l'immagine di partenza per le istruzioni successive. Come best practice, è bene riferisi ad immagini officiali. Docker raccomanda l'utilizzo di immagini Alpine dato che sono controllate e di piccola size (solitamente sotto i 6MB), rimanendo sempre una distribuzione Linux completa.

- `LABEL`. Consente di assegnare dei label all'immagine, per organizzare le immagini per progetto, per supportare delle automazioni o per qualsiasi altro fine. Per ogni label che si vuole aggiungere, bisogna inserire una riga con `LABEL <key>=<value>` nel Dockerfile.

- `RUN`. L'istruzione consente di eseguire qualsiasi comando e creare un layer sopra l'immagine corrente. Il layer viene utilizzato per il prossimo step nel Dockerfile. Si consiglia di scrivere i comandi su più linee in modo da favorirne una più chiara leggibilità e di concatenarli utilizzando l'operatore `&&`. 
  - *cache busting*. Uno use-case comune per `RUN` nelle immagini Debian-based è quello di installare software utilizzando `apt-get`. **Come best practice si suggerisce di utilizzare** `apt-get update` **ed** `apt-get install` **nello stesso comando di** `RUN`. Utilizzare da solo `apt-get update` causa problemi legati alla cache e porta il successivo comando `apt-get install` a fallire.

    ```docker
    # syntax=docker/dockerfile:1

    FROM ubuntu:22.04
    RUN apt-get update
    RUN apt-get install -y --no-install-recommends curl
    ```
    In questo esempio, se si dovesse aggiungere un nuovo package oltre a `curl`, Docker non esegue nuovamente il comando di `apt-get update`, perchè non è stato modificato ed utilizza la versione precedente in cache. Questo potrebbe comportare l'installazione di una versione obsoleta dei packages che sono stati inclusi nell'istruzione di `apt-get install`. Utilizzarli insieme evita questo problema e consente di ottenere l'ultima versione: **questa tecnica è detta di cache busting**. Il cache busting può essere utilizzato anche specificando una determinata versione del package.

- `CMD`. Il comando viene utilizzato per eseguire il software contenuto nell'immagine quando viene eseguita come container. **Può esserci solo un'istruzione `CMD` in un Dockerfile**, se ne vengono specificate di più solo l'ultima avrà effetto. Le istruzioni in `CMD` possono essere specificate sia in `exec form` (`["executable", "param1", "param2"]`) o in `shell form` (`command param1 param2`).

- `EXPOSE`. Il comando di `EXPOSE` indica le porte sul quale il container è in ascolto. Per questo comando andrebbero specificate le porte utilizzate dall'applicazione, ad esempio un'immagine che contiene un Apache web server specificherà la porta 80, mentre un'immagine che contiene MongoDB utilizzerà la porta 27017. Quanto specificato in `EXPOSE` può essere sovrascritto a runtime utilizzando l'opzione `-p` di `docker run`.

- `ADD` e `COPY`. `ADD` e `COPY` presentano delle somiglianze. `COPY` consente di copiare file all'interno del container, dal contesto di build oppure da uno stage in una build multi-stage. `ADD` consente di recuperare file remoti, tramite HTTPS o da Git URLs, e di estrarre file tar automaticamente quando vengono aggiunti dal contesto di build. L'utilizzo di `ADD` è migliore rispetto a `wget` o `tar` perchè garantisce la costruizione di una build cache più precisa. Nel caso si debbano aggiungere file temporaneamente ad un container per eseguire un'istruzione di `RUN`, conviene ricorrere al *bind mount* piuttosto che a `COPY`.

- `ENTRYPOINT`. L'istruzione consente di configurare e di eseguire un container come fosse un eseguibile. Così come l'istruzione `CMD`, può essere scritto sia in `exec form` che in `shell form`. Può anche essere combinato con `CMD`, in particolare `ENTRYPOINT` specifica quale processo deve sempre essere eseguito all'avvio del container e `CMD` specifica gli argomenti di default passati ad `ENTRYPOINT`. Questo comportamento viene modificato se si utilizza il comando `docker run <image>`, dove qualsiasi argomento scritto dopo il nome dell'immagine verrà passato ad `ENTRYPOINT` e sostituirà gli eventuali `CMD` nel Dockerfile. L'utilizzo di `ENTRYPOINT` e `CMD` è possibile in `exec form` in quanto la `shell form` previene l'utilizzo degli argomenti presenti in `CMD`. Inoltre, in questo caso il processo non è il PID 1 del container e non riceverà i segnali di terminazione dati da `docker stop <container>`, perchè `ENTRYPOINT` viene eseguito come sottocomando di `/bin/sh -c` che non passa i segnali Unix (es. SIGTERM).

- `VOLUME`. 

- `USER`. L'istruzione consente di impostare lo username e opzionalmente il gruppo come utente e gruppo di default per il resto dello stage corrente. L'utente specificato viene utilizzato per le istruzioni di `RUN` e a runtime, eseguendo le istruzioni `ENTRYPOINT` e `CMD`. Tipicamente questa istruzione viene utilzzata qualora non sia necessario utilizzare i privilegi di root, ma **attenzione: se l'utente non ha un primary group allora l'immagine (o le istruzioni successive) verranno eseguite con il gruppo `root`**.

- `WORKDIR`. Questa istruzione, come best practice, andrebbe sempre utilizzata con un path assoluto ed è preferibile rispetto ad un abuso di `RUN cd .. && do-something`. `WORKDIR` consente di specificare la working directory per i comandi di `RUN`, `CMD`, `ENTRYPOINT`, `COPY` e `ADD` che seguono nel Dockerfile. L'istruzione può essere utilizzata più volte all'interno di un Dockerfile: **se viene fornito un path relativo, è considerato relativo rispetto alla precedente istruzione di `WORKDIR`. La default working directory, se non specificata, è /**. L'istruzione permette di risolvere le variabili di ambiente precedentemente impostate utilizzando `ENV`.
  ```docker
    ENV DIRPATH=/path
    WORKDIR $DIRPATH/$DIRNAME
    RUN pwd
  ```
  L'output del comando `pwd` sarà /path/$DIRNAME.

- `ONBUILD`.