# SmartCard Backend Starter

Architecture backend modulaire avec Express, PostgreSQL, Prisma et Neon.

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

## Structure

- `src/modules`: organisation feature-based par domaine
- `src/config`: configuration centralisee
- `src/middlewares`: middlewares globaux
- `src/utils`: helpers reutilisables
- `prisma/schema.prisma`: modele de donnees

## Packages

- `express`: framework HTTP minimal et flexible
- `dotenv`: chargement des variables d'environnement
- `cors`: controle des origines frontend
- `helmet`: headers de securite HTTP
- `morgan`: logs de requetes
- `prisma`: tooling ORM et migrations
- `@prisma/client`: client Prisma utilise par l'application
- `bcrypt`: hash des mots de passe
- `jsonwebtoken`: emission et verification des JWT
- `zod`: validation claire et maintenable
- `uuid`: generation d'identifiants uniques cote application
- `nodemon`: reload automatique en developpement
- `eslint`: qualite de code
- `prettier`: formatage coherent
