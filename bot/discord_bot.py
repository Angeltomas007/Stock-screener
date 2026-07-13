"""
Bot Discord interactif — répond aux commandes !achat, !short, !recap, !ticker
=============================================================================
Différent du screener automatique (stock_screener.py) : celui-ci reste connecté
en permanence et RÉPOND quand tu lui écris dans Discord.

Nécessite un hébergement qui tourne 24h/24 (pas GitHub Actions) — voir README_BOT.md.
"""

import os
import sys
import discord

# Réutilise toute la logique d'analyse déjà écrite dans stock_screener.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from stock_screener import WATCHLIST, analyze_ticker  # noqa: E402

DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN")

intents = discord.Intents.default()
intents.message_content = True  # nécessaire pour lire le texte des messages
client = discord.Client(intents=intents)


def format_ticker_line(r: dict) -> str:
    tag = ""
    if r["buy_signal"]:
        tag = f" 🟢 ACHAT {r['buy_confidence']}"
    elif r["short_signal"]:
        tag = f" 🔴 SHORT {r['short_confidence']}"
    return f"{r['ticker']}: {r['price']} | RSI {r['rsi']}{tag}"


async def analyze_watchlist():
    """Analyse tous les tickers de la watchlist (peut prendre quelques secondes)."""
    results = []
    for ticker in WATCHLIST:
        r = analyze_ticker(ticker)
        if r:
            results.append(r)
    return results


@client.event
async def on_ready():
    print(f"[BOT] Connecté en tant que {client.user}")


@client.event
async def on_message(message: discord.Message):
    if message.author == client.user:
        return  # ignore ses propres messages

    content = message.content.strip().lower()

    if content in ("!achat", "!achats"):
        await message.channel.send("🔎 Analyse en cours...")
        results = await analyze_watchlist()
        buys = [r for r in results if r["buy_signal"]]
        if not buys:
            lowest_rsi = sorted(results, key=lambda r: r["rsi"])[:5]
            lines = "\n".join(format_ticker_line(r) for r in lowest_rsi)
            await message.channel.send(
                f"Aucun signal d'achat confirmé actuellement.\n"
                f"Les RSI les plus bas de ta watchlist en ce moment :\n{lines}"
            )
        else:
            lines = "\n".join(format_ticker_line(r) for r in buys)
            await message.channel.send(f"🟢 *Signaux d'achat actuels :*\n{lines}")

    elif content in ("!short", "!vente"):
        await message.channel.send("🔎 Analyse en cours...")
        results = await analyze_watchlist()
        shorts = [r for r in results if r["short_signal"]]
        if not shorts:
            highest_rsi = sorted(results, key=lambda r: -r["rsi"])[:5]
            lines = "\n".join(format_ticker_line(r) for r in highest_rsi)
            await message.channel.send(
                f"Aucun signal short confirmé actuellement.\n"
                f"Les RSI les plus hauts de ta watchlist en ce moment :\n{lines}"
            )
        else:
            lines = "\n".join(format_ticker_line(r) for r in shorts)
            await message.channel.send(f"🔴 *Signaux short actuels :*\n{lines}")

    elif content in ("!recap", "!récap"):
        await message.channel.send("🔎 Analyse en cours...")
        results = await analyze_watchlist()
        results.sort(key=lambda r: r["rsi"])
        lines = "\n".join(format_ticker_line(r) for r in results)
        await message.channel.send(f"📊 *État actuel de la watchlist :*\n{lines}")

    elif content.startswith("!ticker "):
        ticker = content.replace("!ticker ", "").strip().upper()
        await message.channel.send(f"🔎 Analyse de {ticker}...")
        r = analyze_ticker(ticker)
        if not r:
            await message.channel.send(f"Impossible de récupérer les données pour {ticker}.")
        else:
            status = "🟢 ACHAT" if r["buy_signal"] else ("🔴 SHORT" if r["short_signal"] else "Neutre")
            await message.channel.send(
                f"*{r['ticker']}* — {r['price']}\n"
                f"RSI(14) : {r['rsi']}\n"
                f"Statut : {status}\n"
                f"Stop loss achat : {r['buy_stop_loss']} | Take profit achat : {r['buy_take_profit']}\n"
                f"Stop loss short : {r['short_stop_loss']} | Take profit short : {r['short_take_profit']}"
            )

    elif content in ("!aide", "!help", "!commandes"):
        await message.channel.send(
            "*Commandes disponibles :*\n"
            "`!achat` — signaux d'achat actuels sur la watchlist\n"
            "`!short` — signaux short actuels sur la watchlist\n"
            "`!recap` — état complet de la watchlist (RSI de chaque titre)\n"
            "`!ticker AAPL` — analyse détaillée d'un titre précis\n"
        )


if __name__ == "__main__":
    if not DISCORD_BOT_TOKEN:
        raise SystemExit("DISCORD_BOT_TOKEN manquant dans les variables d'environnement.")
    client.run(DISCORD_BOT_TOKEN)
