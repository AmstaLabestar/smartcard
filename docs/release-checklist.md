# Release Checklist V1

## Backend

- `npm install`
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run smoke`
- `npm run lint`
- `npm run dev`
- tester `GET /health`

## Flux metier a verifier

- inscription `USER`
- connexion `USER`
- achat de carte
- activation de carte
- connexion `MERCHANT`
- creation d'offre
- scan avec QR code valide
- verification transaction creee
- verification route admin avec un compte `ADMIN`

## Variables d'environnement

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `JSON_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`

## Points de demo

- un `USER` voit sa carte et son QR code
- un `MERCHANT` cree une offre et valide un scan
- un `ADMIN` consulte les listings principaux
- les erreurs API ont un format uniforme
- les scans dupliques sont bloques
