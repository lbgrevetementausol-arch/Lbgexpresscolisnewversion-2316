#!/bin/bash
# Déploiement LBG Express Colis : espace de travail Runable -> VPS Hostinger
# Usage : bash /home/user/lbg-deploy/deploy.sh
set -euo pipefail

APP=/home/user/lbg-express
KEY=/home/user/.ssh/lbg_vps
HOST=root@187.7.18.167
SSH="ssh -i $KEY -o StrictHostKeyChecking=no -o IdentitiesOnly=yes $HOST"

echo "==> Sauvegarde de la base avant déploiement"
$SSH "/usr/local/bin/lbg-backup.sh"

echo "==> Nettoyage des paquets inutiles en production (mobile, desktop)"
$SSH "rm -rf /var/www/lbg-express/packages/mobile /var/www/lbg-express/packages/desktop /var/www/lbg-express/.runable"

echo "==> Envoi du code source (site web uniquement)"
tar czf - -C "$APP" \
  --exclude=node_modules --exclude=dist --exclude=.git \
  --exclude=.turbo --exclude=.env --exclude=.env.bak \
  --exclude=local.db --exclude=local.db-shm --exclude=local.db-wal --exclude=uploads \
  --exclude=packages/mobile --exclude=packages/desktop --exclude=.runable . \
  | $SSH "tar xzf - -C /var/www/lbg-express"

echo "==> Dépendances + build + schéma"
$SSH 'export PATH=/root/.bun/bin:$PATH; cd /var/www/lbg-express && bun install && bun run build:web && cd packages/web && bun run db:push --force'

echo "==> Redémarrage du service"
$SSH "systemctl restart lbg-express && sleep 4 && systemctl is-active lbg-express"

echo "==> Vérification"
code=$($SSH "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4200/")
echo "HTTP local : $code"
[ "$code" = "200" ] || { echo "ÉCHEC — voir: ssh ... journalctl -u lbg-express -n 50"; exit 1; }
echo "Déploiement terminé : http://187.7.18.167"
