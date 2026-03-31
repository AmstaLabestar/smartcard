# SmartCard Backend

Backend V1 modulaire pour une application de carte de reduction, construit avec Express, Prisma, PostgreSQL et Neon.

## Stack

- `express`
- `prisma`
- `@prisma/client`
- `postgresql / neon`
- `zod`
- `jsonwebtoken`
- `bcrypt`
- `helmet`
- `cors`
- `morgan`

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run smoke
npm run dev
```

## Scripts utiles

```bash
npm run dev
npm run start
npm run prisma:generate
npm run prisma:push
npm run smoke
npm run lint
npm run check
```


## Tests

La fondation de test couvre deja :

- les services critiques `card` et `transaction`
- la validation centralisee
- un contrat HTTP de base sur `/health` et le format d erreur

Scripts disponibles :

```bash
npm run test
npm run test:unit
npm run test:integration
```

Les tests sont volutivement legers et se concentrent sur les regles metier et les reponses API les plus critiques.

## CI

Une GitHub Action `Backend CI` verifie automatiquement :

- l installation des dependances
- la generation Prisma
- le lint
- les tests
- les smoke checks

Le workflow est lance sur `main`, sur les branches `feature/*` et sur les pull requests.

## Structure

- `src/modules`: architecture feature-based
- `src/config`: configuration centralisee
- `src/middlewares`: auth, erreurs, rate limiting, request context
- `src/utils`: helpers de reponse, logs, validation, tokens
- `prisma/schema.prisma`: modele de donnees
- `docs/release-checklist.md`: checklist de demo et de verification

## Modules disponibles

- `auth`
- `me`
- `user`
- `card`
- `offer`
- `transaction`

## Flux MVP valide

1. un user s'inscrit et se connecte
2. il achete sa carte
3. il active sa carte
4. un merchant cree une offre
5. le merchant scanne le QR du client
6. le backend calcule la reduction
7. la transaction est enregistree
8. un admin peut consulter les listings principaux

## Endpoints principaux

### Sante

- `GET /health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Me

- `GET /api/me`
- `GET /api/me/card`
- `GET /api/me/transactions`

### Cards

- `POST /api/cards/purchase`
- `POST /api/cards/activate`
- `GET /api/cards/me`
- `GET /api/cards/admin/all`

### Offers

- `GET /api/offers`
- `GET /api/offers/mine`
- `POST /api/offers`
- `PATCH /api/offers/:offerId/status`
- `GET /api/offers/admin/all`

### Transactions

- `POST /api/transactions/scan`
- `GET /api/transactions/mine`
- `GET /api/transactions/merchant`

### Admin users

- `GET /api/users/admin/all`
- `GET /api/users/admin/merchants`

## Variables d'environnement

Voir [`.env.example`](C:\dev\smartCard_backend\.env.example).

Clés principales :

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `JSON_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`

## Hardening deja en place

- format uniforme des reponses API
- middleware global d'erreur
- `requestId` sur les erreurs
- rate limiting simple
- limite de taille des payloads JSON
- logs transactionnels structures
- verification de scans dupliques

## Verification avant demo

Utiliser :

```bash
npm run smoke
```

Puis suivre :

- [docs/release-checklist.md](docs/release-checklist.md)
