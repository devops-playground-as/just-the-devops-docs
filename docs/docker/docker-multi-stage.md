# Multi-stage Docker builds

L'utilizzo di Multi-stage Docker builds consente di creare immagini Docker ottimizzate, separando il *build environment* dal *runtime environment*. In questo modo, è possibile creare immagini più leggere, sicure e facili da manutenere. **Un Dockerfile multi-stage presenta più di una clausola FROM, ciascuna delle quali rappresenta uno stage con la sua immagine di base e le sue istruzioni**. Di seguito viene mostrato un esempio:

```docker
# Build stage
FROM golang:1.22 AS build
WORKDIR /app
COPY . .
RUN go build -o main

# Runtime stage
FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/main .
CMD ["./main"]
```

Il *build stage* compila l'applicazione, mentre il *runtime stage* esegue solo il binario, output della compilazione. Nel caso presentato il secondo stage richiede un output dal primo stage, ma questo non si verifica sempre. **La presenza di stage indipendenti tra loro, anche se definiti sequenzialmente nel Dockerfile, consente di effettuare la loro build in parallelo, diminuendo così il tempo di build complessivo**. Docker gestisce questo parallelismo automaticamente. 

Nel caso sia invece necessario utilizzare l'output di uno stage in quelli successivi si può ricorrere, come nell'esempio mostrato, a `COPY --from` che consente di specificare come argomento del flag `from` uno stage e di indicare successivamente quali file copiare dallo stage specificato. Proprio per referenziare gli stage, come best practice è necessario denominarli utilizzando la keywork `AS` dopo l'immagine specificata nel `FROM`.

```docker
FROM node:20 AS frontend-build
# Frontend build stage instructions...

FROM golang:1.22 AS backen-build
# Backend build stage instructions...

FROM apline:3.20 AS runtime
COPY --from=frontend-build ...
COPY --from=backend-build ...
# Runtime stage instructions...
```

Come anticipato, la separazione degli stage comporta una serie di vantaggi, riepilogati di seguito.

- **Immagine più leggera**: includendo solo i componenti necessari a runtime, la grandezza dell'immagine prodotta è notevolmente inferirore rispetto alla controparte single-stage, con conseguente **aumento di velocità nel trasferimento, diminuzione dei requisiti di storage e uno startup del container più rapido**.

- **Miglioramento della sicurezza**: l'esclusione nell'immagine finale dei tool di build, deii compilatori e delle dipendenze di sviluppo, riduce la superficie d'attacco ed il rischio di vulnerabilità di sicurezza.

- **Aumento della manutenibilità**: la modularizzazione del Dockerfile in stage distinti consente di poterli mantenere con più facilità.

- **Build più veloci e parallelismo**: il multi-stage consente di sfruttare maggiormente la cache e se le dipendenze o il codice non sono state modificati, le build successive possono riutilizzare i layer in cache. Inoltre, i tempi di build possono essere significativamente ridotti in quanto stage diversi possono eseguire la build in parallelo contemporaneamente. Questo risulta particolarmente utile nei casi di applicazioni complesse con diverse componenti.

- **Flessibiltà nella scelta delle immagini**: le build multi-stage consentono di scegliere l'immagine più adatta per ogni stage: si impiegano immagini leggere per il runtime stage e ad altre, più "pesanti", per il build stage, magari dotate di tutti i build tools necessari per la costruzione dell'artefatto.
