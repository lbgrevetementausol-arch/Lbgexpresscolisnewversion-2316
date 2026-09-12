#!/bin/bash
# Sauvegarde quotidienne LBG Express Colis.
# Contenu : base de donnees, documents livreurs, configuration du serveur.
# Declenche par le timer systemd lbg-backup.timer (03h30) et avant chaque
# deploiement. Restauration : voir GUIDE-EXPLOITATION.md du depot.
set -euo pipefail

DATA=/var/lib/lbg-express
APP=/var/www/lbg-express
DEST=/var/backups/lbg-express
RETENTION_JOURS=14

horodatage=$(date +%F-%H%M)
mkdir -p "$DEST"
chmod 700 "$DEST"

# 1. Base SQLite : ".backup" produit une copie coherente meme site en marche.
sqlite3 "$DATA/lbg.db" ".backup '$DEST/lbg-$horodatage.db'"
gzip -f "$DEST/lbg-$horodatage.db"

# 2. Documents transmis par les livreurs (pieces d'identite, permis, Kbis...).
if [ -d "$DATA/uploads" ]; then
  tar czf "$DEST/uploads-$horodatage.tar.gz" -C "$DATA" uploads
fi

# 3. Configuration : contient les cles API, indispensable pour remonter le
#    site sur une autre machine. Lisible par root uniquement.
if [ -f "$APP/.env" ]; then
  cp "$APP/.env" "$DEST/config-$horodatage.env"
fi

chmod 600 "$DEST"/* 2>/dev/null || true

# 4. Purge des sauvegardes trop anciennes.
find "$DEST" -maxdepth 1 -name 'lbg-*.db.gz' -mtime "+$RETENTION_JOURS" -delete
find "$DEST" -maxdepth 1 -name 'uploads-*.tar.gz' -mtime "+$RETENTION_JOURS" -delete
find "$DEST" -maxdepth 1 -name 'config-*.env' -mtime "+$RETENTION_JOURS" -delete

echo "$(date -Is) sauvegarde terminee — total $(du -sh "$DEST" | cut -f1)" >> /var/log/lbg-backup.log
