# GoldenStay

Web app di prenotazione per una struttura affacciata sul mare a Tropea. L'ospite
sceglie date e numero di ospiti, confronta camere e suite con il totale del
soggiorno già calcolato, apre la scheda della camera e prenota, ricevendo la
ricevuta in PDF. Un'area riservata permette all'amministratore di creare
camere e gestire le prenotazioni.

**Online:** [goldenstay.vercel.app](https://goldenstay.vercel.app) (frontend
su Vercel, backend su Render — vedi sotto se il catalogo non si carica).

## Architettura

```
GoldenStay-Angular/     frontend Angular, organizzato per funzionalità
GoldenStayBackEnd/      API REST Spring Boot + PostgreSQL
```

Il frontend parla con il backend solo via `environment.apiUrl`
(`GoldenStay-Angular/src/environments/`): `environment.ts` punta a
`localhost:8080` in sviluppo, `environment.prod.ts` all'indirizzo del
servizio Render in produzione.

### Pattern usati nel backend

- **Strategy** (`.../core/strategies` sul frontend, tariffe lato backend):
  listino, alta stagione di agosto, weekend (+20%), sconto oltre le sette
  notti (−15%), applicate in ordine di priorità.
- **Factory** (`.../factory`): crea camere Standard, Deluxe e Suite senza
  spargere `new RoomXxx()` nel resto del codice.

## Avvio in locale

### Backend

Serve un PostgreSQL vuoto:

```sql
CREATE DATABASE goldenstay_db;
```

`application.properties` legge tutto da variabili d'ambiente, con dei
default per lo sviluppo locale:

| Variabile | Default locale |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/goldenstay_db` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | *(vuoto — impostala tu)* |
| `ALLOWED_ORIGINS` | `http://localhost:4200` |

Imposta almeno la password prima di avviare, poi:

```bash
cd GoldenStayBackEnd
mvn spring-boot:run
```

Hibernate crea le tabelle da solo al primo avvio (`ddl-auto=update`).

### Frontend

```bash
cd GoldenStay-Angular
npm install
npm start
```

Apre su `http://localhost:4200` e parla col backend locale.

## Deploy

**Backend (Render).** Nel repository c'è un `render.yaml`: da Render, "New +"
→ "Blueprint" → seleziona questo repository. Crea da solo il servizio web
(build da `GoldenStayBackEnd/Dockerfile`) e un database Postgres collegato.
Dopo il primo deploy, in "Environment" del servizio aggiungi anche
`ALLOWED_ORIGINS` con il dominio del frontend pubblicato (per es.
`https://goldenstay.vercel.app`), separando più origini con una virgola.

**Frontend (Vercel).** Build Angular standard
(`outputDirectory: dist/Angular-GoldenStay/browser`, già in `vercel.json`).
Se cambi il nome del servizio Render, aggiorna l'URL in
`environment.prod.ts` prima di ripubblicare.
