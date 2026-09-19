#!/usr/bin/env bash
# Installe (ou met à jour) le timer systemd des relances de panier abandonné.
# Idempotent : relançable sans risque.
#
# Cadence du timer : toutes les 15 minutes. La première relance « petit colis »
# part 1 h après l'abandon, donc un passage au quart d'heure suffit à la déclencher
# avec au plus 15 minutes de retard. Les délais eux-mêmes sont dans le code
# (packages/web/src/api/services/abandoned-carts.ts), pas dans le timer.
set -euo pipefail

SSH_KEY=${SSH_KEY:-/home/user/.ssh/lbg_vps}
HOST=${HOST:-root@187.7.18.167}

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o IdentitiesOnly=yes "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail

cat > /usr/local/bin/lbg-carts.sh <<'SH'
#!/usr/bin/env bash
# Relances de panier abandonné : appelle la route cron de l'application.
set -u
KEY=$(grep '^CRON_SECRET=' /var/www/lbg-express/.env | cut -d'"' -f2)
OUT=$(curl -s -m 120 -X POST -H "x-lbg-cron-key: $KEY" http://127.0.0.1:4200/api/cron/abandoned-carts)
echo "$(date -Is) $OUT" >> /var/log/lbg-carts.log
SH
chmod +x /usr/local/bin/lbg-carts.sh

cat > /etc/systemd/system/lbg-carts.service <<'UNIT'
[Unit]
Description=LBG Express - relances de panier abandonne
After=network-online.target lbg-express.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/lbg-carts.sh
UNIT

cat > /etc/systemd/system/lbg-carts.timer <<'UNIT'
[Unit]
Description=Relances de panier abandonne - toutes les 15 minutes

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
UNIT

# Rotation du journal : sans cela le fichier grossit indéfiniment (96 passages/jour).
cat > /etc/logrotate.d/lbg-carts <<'ROT'
/var/log/lbg-carts.log {
    weekly
    rotate 8
    compress
    missingok
    notifempty
    copytruncate
}
ROT

systemctl daemon-reload
systemctl enable --now lbg-carts.timer
systemctl list-timers --all --no-pager | grep lbg-carts
REMOTE
