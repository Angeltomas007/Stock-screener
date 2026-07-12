# Stock Screener RSI + MACD + Bollinger — Guide d'installation (100% gratuit)

## Architecture

```
GitHub Actions (cron, gratuit) → stock_screener.py → yfinance (données)
                                                    → Telegram Bot (notifications)
```

Pas de serveur à payer, pas de connexion manuelle : GitHub exécute le script
automatiquement selon le planning défini dans `.github/workflows/daily_screener.yml`.

## Étape 1 — Créer le bot Telegram (5 min)

1. Ouvre Telegram, cherche **@BotFather**, envoie `/newbot`.
2. Donne un nom et un username à ton bot. BotFather te donne un **token**
   (ex: `123456789:ABC-def...`) → note-le, c'est `TELEGRAM_TOKEN`.
3. Démarre une conversation avec ton nouveau bot (clique "Start").
4. Récupère ton **chat_id** : va sur
   `https://api.telegram.org/bot<TON_TOKEN>/getUpdates` dans un navigateur
   après avoir envoyé un message au bot. Cherche `"chat":{"id": ...}` →
   c'est ton `TELEGRAM_CHAT_ID`.

## Étape 2 — Créer le repo GitHub

1. Crée un nouveau repo GitHub (public ou privé, peu importe).
2. Mets-y les fichiers : `stock_screener.py`, `requirements.txt`,
   `.github/workflows/daily_screener.yml`.
3. Va dans **Settings → Secrets and variables → Actions → New repository secret**
   et ajoute :
   - `TELEGRAM_TOKEN`
   - `TELEGRAM_CHAT_ID`

## Étape 3 — Personnaliser ta watchlist

Ouvre `stock_screener.py`, modifie la liste `WATCHLIST` en haut du fichier
avec les tickers qui t'intéressent (format Yahoo Finance : `AAPL`, `AIR.PA`,
`BTC-USD`, etc.).

## Étape 4 — Activer l'automatisation

Le workflow GitHub Actions est déjà configuré pour :
- Vérifier les signaux **toutes les heures** entre 8h et 22h UTC (jours ouvrés)
  → alerte Telegram instantanée dès qu'une action **entre** en zone d'achat
  (pas de spam répété, grâce au fichier d'état `stock_state.json`).
- Envoyer un **récap complet** chaque soir à 21h UTC.

Ajuste les horaires cron dans `daily_screener.yml` selon ton fuseau horaire
(les crons GitHub sont en UTC).

Tu peux aussi lancer le workflow manuellement : onglet **Actions** du repo →
sélectionne "Stock Screener" → **Run workflow**.

## Comment fonctionne le signal d'achat

- **RSI(14) < 30** → survente
- **ET prix proche/sous la bande basse de Bollinger(20,2)** → confirme que
  la baisse est statistiquement extrême (réduit les faux signaux d'un RSI
  bas en tendance baissière prolongée)
- **MACD** (histogramme qui remonte) → bonus de confiance affiché en étoiles,
  signale un possible retournement de momentum

## Limites à connaître

- yfinance fournit des données **différées** (pas du tick en temps réel),
  largement suffisant pour une stratégie sur RSI journalier.
- Ceci est un outil d'aide à la décision, **pas un conseil en investissement**.
  Les faux signaux existent toujours, backteste avant d'agir avec de l'argent réel.
- Si tu veux du vrai temps réel intrajournalier, il faudrait une API de streaming
  payante (ex: Polygon.io, Alpaca) — pas nécessaire pour une stratégie RSI journalière.

## Extensions possibles

- Ajouter le volume (confirmation supplémentaire)
- Screener sur plusieurs unités de temps (RSI hebdo + RSI journalier)
- Ajouter un stop-loss / take-profit suggéré dans l'alerte
- Passer à Discord (webhook, encore plus simple que Telegram) si tu préfères
