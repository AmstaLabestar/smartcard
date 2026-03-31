# VPS Deployment

Ce guide prepare un deploiement manuel simple sur un VPS Linux avec Docker et Nginx.

## Prerequis

- Docker et Docker Compose plugin installes
- Nginx installe sur le serveur
- un nom de domaine ou sous-domaine pour le frontend
- un nom de domaine ou sous-domaine pour l'API
- une base PostgreSQL ou Neon deja disponible

## Backend

1. Cloner le repo backend sur le VPS.
2. Copier [`deploy/backend.env.example`](../deploy/backend.env.example) vers `deploy/backend.env`.
3. Renseigner les vraies valeurs de production.
4. Lancer :

```bash
cd smartCard_backend/deploy
docker compose -f docker-compose.backend.yml up -d --build
```

Le backend sera accessible localement sur `127.0.0.1:4000`.

## Reverse Proxy API

1. Copier [`deploy/nginx/smartcard.conf`](../deploy/nginx/smartcard.conf) dans `/etc/nginx/sites-available/smartcard-api`.
2. Adapter `server_name`.
3. Activer la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/smartcard-api /etc/nginx/sites-enabled/smartcard-api
sudo nginx -t
sudo systemctl reload nginx
```

Ajoutez ensuite votre certificat TLS avec Certbot ou votre gestionnaire SSL habituel.

## Frontend

Le frontend est dockerise dans son propre repo. Le guide du repo frontend fournit son `docker-compose` et sa configuration Nginx conteneur.

## Mise A Jour

Pour mettre a jour le backend sur le VPS :

```bash
git pull origin main
cd deploy
docker compose -f docker-compose.backend.yml up -d --build
```

## Verification Rapide

- `docker ps`
- `docker logs smartcard-backend`
- `curl http://127.0.0.1:4000/health`
