# Principi

Nell'ottobre del 2021, il GitOps Working Group ha rilasciato i *GitOps principles*, ovvero un set di principi per gestire i sistemi software. Con questa release il working group vuole definire cos'è il GitOps e non lasciare che diventi solo un'altra *buzzword*.

## Principio 1: Declarative

Il primo principio GitOps afferma che:

> *Un sistema gestito dal GitOps deve avere il proprio stato espresso dichiaritivamente.*
> 
> *A system managed by GitOps must have its desired state expressed declaritvely.*

Il concetto di *desidered state* indica la rappresentazione del funzionamento del sistema nel suo stato finale. Lo stato finale viene raggiunto grazie all'applicazione dei cambiamenti fatti dal GitOps environment.

## Principio 2: Versioned and Immutable

> *Lo stato desiderato viene memorizzato in un modo che fa rispettare l'**immutabilità**, il **versionamento** e che mantiene **la storia completa delle sue modifiche**.*
> 
> *Desired state is stored in a way that enforces **immutability**, **versioning**, and retains a **complete version history**.*

Il concetto di "versionato ed immutabile" è anche uno dei principi fondamentali di Git, il che spiega perchè il GitOps ha scelto questo nome. Sfruttare questa funzionalità di Git rende il GitOps versionato ed immutabile in quanto ogni cambiamento è tracciato in una nuova versione, senza alterare quelle precedenti. **L'applicazione di questo principio mira a garantire la possbilità di ripristinare una versione passata**, mantendendo contemporaneamente un audit di tutti i cambiamenti che sono stati fatti.

## Principio 3: Pulled Automatically

> *Gli agenti pullano automaticamente la dichiarazione dello stato desiderato dalla sorgente.*
>
> *Software agents automatically pull the desired state declaration from the source.*

Con questo principio il GitOps si inizia a differenziare da un tradizionale processo CI/CD event-driven. Sebbene azionare modifiche ed aggiornamenti attraverso i webhook o altri meccanismi analoghi sia un valido modo per automatizzare le build, non è di per se GitOps. I ***GitOps software agents*** (o *GitOps Controllers*) controllano lo stato desiderato pullando e verificando la sua dichiarazione su Git ad intervalli regolari (*polling as well pulling*). In altri termini, nell'approccio GitOps non c'è un webhook che deve essere azionato. Esiste invece un **ciclo di riconciliazione o *reconciliation loop***.

## Principio 4: Continuosly reconciled

> *Gli agenti osservano **continuamente** lo stato attuale del sistema e cercano di ricondurlo a quello desiderato.*
>
> *Software agents **continuously** observe the actual system state and attempt to apply the desired state.*

Questo principio richiama la funzione dei controller Kubernetes, ma il GitOps lo applica ad un'intera applicazione o ad uno stack infrastrutturale invece di un solo oggetto. Come affermato nel principio precedente, il GitOps recupera lo stato desiderato da uno *storage system*, e.g. repository Git, versionato ed immutabile e, nel caso caso ci sia una differenza tra lo stato desiderato e quello attuale, quest'ultimo vieni riconciliato apportanto modifiche sul sistema. Questo si verifica continuamente ad intervalli regolari; con "continuamente" si intende che la riconciliazione avviene in intervalli di tempo definiti e non deve essere istantanea.

**Riferimenti**

- [GitOps principles release 1.0.0](https://github.com/open-gitops/documents/releases/tag/v1.0.0)
- [Argo CD: Up and Running](https://www.oreilly.com/library/view/argo-cd-up/9781098141998/)