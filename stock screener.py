"""
Screener quotidien RSI + MACD + Bollinger Bands
=================================================
Surveille une watchlist d'actions, détecte les zones de survente
et envoie des alertes Telegram (temps réel + récap quotidien).

Aucune connexion/scraping requis : données via yfinance (gratuit).
"""

import os
import json
import requests
import yfinance as yf
import pandas as pd
from datetime import datetime

# --------------------------------------------------------------------------
# CONFIGURATION
# --------------------------------------------------------------------------

# Modifie cette liste avec les tickers qui t'intéressent (format Yahoo Finance)
# Watchlist principale (suivi RSI/MACD/Bollinger classique)
WATCHLIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "AIR.PA", "MC.PA", "OR.PA",   # exemples actions Euronext Paris
]

# Candidats "pépites méconnues" à évaluer (ajoute des tickers ici — small/mid-cap
# que tu veux surveiller ; le script ne "découvre" pas de nouvelles actions seul)
CANDIDATE_TICKERS = [
    # Exemples à remplacer par tes propres idées de recherche :
    "CELH", "SOUN", "ASTS",
]
MARKET_CAP_MAX = 10_000_000_000   # ne considère que les capis < 10 Md$ ("méconnues")
MIN_REVENUE_GROWTH = 0.10          # croissance CA minimum (10%) pour retenir le titre
MAX_FORWARD_PE = 30                # évite les valorisations extrêmes

RSI_PERIOD = 14
RSI_OVERSOLD_THRESHOLD = 30      # signal ACHAT (long)
RSI_OVERBOUGHT_THRESHOLD = 70    # signal VENTE À DÉCOUVERT (short)
BB_PERIOD = 20
BB_STD = 2
MACD_FAST, MACD_SLOW, MACD_SIGNAL = 12, 26, 9
TREND_MA_PERIOD = 200  # filtre de tendance de fond (Murphy)
ATR_PERIOD = 14
ATR_STOP_MULTIPLIER = 1.5  # taille du stop en multiples d'ATR

# Un webhook par salon Discord (crée-les dans Discord et colle les URLs en secrets GitHub)
DISCORD_WEBHOOK_BUY = os.environ.get("DISCORD_WEBHOOK_BUY")
DISCORD_WEBHOOK_SHORT = os.environ.get("DISCORD_WEBHOOK_SHORT")
DISCORD_WEBHOOK_SUMMARY = os.environ.get("DISCORD_WEBHOOK_SUMMARY")
DISCORD_WEBHOOK_OPPORTUNITIES = os.environ.get("DISCORD_WEBHOOK_OPPORTUNITIES")  # salon #pepites

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
CLAUDE_MODEL = "claude-haiku-4-5-20251001"  # rapide et peu coûteux, suffisant pour ce résumé

STATE_FILE = os.path.join(os.path.dirname(__file__), "stock_state.json")

# --------------------------------------------------------------------------
# INDICATEURS
# --------------------------------------------------------------------------

def compute_rsi(close: pd.Series, period: int = RSI_PERIOD) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def compute_macd(close: pd.Series, fast=MACD_FAST, slow=MACD_SLOW, signal=MACD_SIGNAL):
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_bollinger(close: pd.Series, period=BB_PERIOD, num_std=BB_STD):
    sma = close.rolling(period).mean()
    std = close.rolling(period).std()
    upper = sma + num_std * std
    lower = sma - num_std * std
    return upper, sma, lower


def compute_atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    prev_close = close.shift(1)
    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low - prev_close).abs(),
    ], axis=1).max(axis=1)
    return tr.rolling(period).mean()


# --------------------------------------------------------------------------
# ANALYSE DES NEWS (gratuit, via Yahoo Finance, scoring par mots-clés)
# --------------------------------------------------------------------------

POSITIVE_WORDS = [
    "upgrade", "surge", "beat", "beats", "growth", "strong", "outperform",
    "raises", "bullish", "rally", "record", "soar", "soars", "gains",
    "buy rating", "top pick", "breakthrough", "exceeds",
]
NEGATIVE_WORDS = [
    "downgrade", "plunge", "miss", "misses", "weak", "cuts", "cut",
    "lawsuit", "recall", "decline", "bearish", "selloff", "falls",
    "drops", "warns", "warning", "investigation", "layoffs", "fraud",
]


def get_news_sentiment(ticker: str, max_articles: int = 6):
    """Score simple (+1/-1 par mot-clé) sur les derniers titres d'actu Yahoo Finance."""
    try:
        news_items = yf.Ticker(ticker).news or []
    except Exception as e:
        print(f"[WARN] Impossible de récupérer les news pour {ticker}: {e}")
        return 0, []

    headlines = []
    score = 0
    for item in news_items[:max_articles]:
        title = item.get("title") or item.get("content", {}).get("title", "")
        if not title:
            continue
        headlines.append(title)
        title_lower = title.lower()
        score += sum(1 for w in POSITIVE_WORDS if w in title_lower)
        score -= sum(1 for w in NEGATIVE_WORDS if w in title_lower)

    return score, headlines


# --------------------------------------------------------------------------
# DONNÉES FONDAMENTALES + ANALYSE "PÉPITES MÉCONNUES" (via API Claude)
# --------------------------------------------------------------------------

def get_fundamentals(ticker: str) -> dict | None:
    try:
        info = yf.Ticker(ticker).info
    except Exception as e:
        print(f"[WARN] Fondamentaux indisponibles pour {ticker}: {e}")
        return None

    return {
        "name": info.get("shortName", ticker),
        "sector": info.get("sector", "N/A"),
        "market_cap": info.get("marketCap"),
        "forward_pe": info.get("forwardPE"),
        "revenue_growth": info.get("revenueGrowth"),
        "profit_margins": info.get("profitMargins"),
    }


def qualifies_as_opportunity(fundamentals: dict) -> bool:
    if not fundamentals:
        return False
    mcap = fundamentals.get("market_cap")
    growth = fundamentals.get("revenue_growth")
    pe = fundamentals.get("forward_pe")
    if mcap is None or mcap > MARKET_CAP_MAX:
        return False
    if growth is None or growth < MIN_REVENUE_GROWTH:
        return False
    if pe is not None and pe > MAX_FORWARD_PE:
        return False
    return True


def generate_claude_analysis(ticker: str, fundamentals: dict, rsi: float, news_score: int, headlines: list[str]) -> str | None:
    """Demande à l'API Claude un résumé factuel de 5 à 10 lignes basé UNIQUEMENT sur les données fournies."""
    if not ANTHROPIC_API_KEY:
        print("[WARN] ANTHROPIC_API_KEY manquant, analyse Claude ignorée.")
        return None

    headlines_txt = "\n".join(f"- {h}" for h in headlines[:5]) or "Aucune actualité récente trouvée."
    prompt = (
        f"Voici des données factuelles sur l'action {ticker} ({fundamentals.get('name')}):\n"
        f"- Secteur : {fundamentals.get('sector')}\n"
        f"- Capitalisation : {fundamentals.get('market_cap')}\n"
        f"- PER prévisionnel : {fundamentals.get('forward_pe')}\n"
        f"- Croissance du chiffre d'affaires : {fundamentals.get('revenue_growth')}\n"
        f"- Marge nette : {fundamentals.get('profit_margins')}\n"
        f"- RSI(14) actuel : {rsi}\n"
        f"- Score de sentiment des news (mots-clés) : {news_score}\n"
        f"- Derniers titres d'actualité :\n{headlines_txt}\n\n"
        "Rédige une explication factuelle de 5 à 10 lignes en français expliquant pourquoi ce titre "
        "pourrait présenter un potentiel intéressant, en te basant STRICTEMENT sur les données ci-dessus "
        "(n'invente aucun chiffre ni fait). Termine par une phrase rappelant que ce n'est pas un conseil "
        "en investissement et que cela nécessite une vérification personnelle."
    )

    try:
        r = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": CLAUDE_MODEL,
                "max_tokens": 400,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
        return "\n".join(text_blocks).strip() or None
    except Exception as e:
        print(f"[ERREUR API CLAUDE] {ticker}: {e}")
        return None


def scan_opportunities():
    """Scanne CANDIDATE_TICKERS, retient les titres qui passent le filtre fondamental,
    et génère une explication via l'API Claude pour chacun."""
    found = []
    for ticker in CANDIDATE_TICKERS:
        fundamentals = get_fundamentals(ticker)
        if not qualifies_as_opportunity(fundamentals):
            continue

        # Contexte technique/actu (léger, pour enrichir le prompt)
        try:
            hist = yf.download(ticker, period="6mo", interval="1d", progress=False, auto_adjust=True)
            close = hist["Close"]
            if isinstance(close, pd.DataFrame):
                close = close.iloc[:, 0]
            rsi_val = round(float(compute_rsi(close).iloc[-1]), 1) if len(close) > RSI_PERIOD else None
        except Exception:
            rsi_val = None

        news_score, headlines = get_news_sentiment(ticker)
        analysis = generate_claude_analysis(ticker, fundamentals, rsi_val, news_score, headlines)
        if analysis:
            found.append({"ticker": ticker, "fundamentals": fundamentals, "analysis": analysis})
    return found


# --------------------------------------------------------------------------
# ANALYSE D'UNE ACTION
# --------------------------------------------------------------------------

def analyze_ticker(ticker: str) -> dict | None:
    try:
        data = yf.download(ticker, period="2y", interval="1d", progress=False, auto_adjust=True)
    except Exception as e:
        print(f"[ERREUR] {ticker}: {e}")
        return None

    if data.empty or len(data) < TREND_MA_PERIOD + 5:
        print(f"[SKIP] {ticker}: pas assez de données pour la MM200")
        return None

    close = data["Close"]
    high = data["High"]
    low = data["Low"]
    if isinstance(close, pd.DataFrame):  # sécurité multi-index yfinance
        close = close.iloc[:, 0]
        high = high.iloc[:, 0]
        low = low.iloc[:, 0]

    rsi = compute_rsi(close)
    macd_line, signal_line, hist = compute_macd(close)
    upper_bb, mid_bb, lower_bb = compute_bollinger(close)
    atr = compute_atr(high, low, close, ATR_PERIOD)
    sma200 = close.rolling(TREND_MA_PERIOD).mean()

    last_close = float(close.iloc[-1])
    last_rsi = float(rsi.iloc[-1])
    last_lower_bb = float(lower_bb.iloc[-1])
    last_upper_bb = float(upper_bb.iloc[-1])
    last_mid_bb = float(mid_bb.iloc[-1])
    last_atr = float(atr.iloc[-1])
    last_sma200 = float(sma200.iloc[-1])
    last_hist = float(hist.iloc[-1])
    prev_hist = float(hist.iloc[-2])

    # Confirmation Bollinger
    near_lower_band = last_close <= last_lower_bb * 1.02
    near_upper_band = last_close >= last_upper_bb * 0.98

    # Momentum MACD
    macd_turning_up = last_hist > prev_hist
    macd_turning_down = last_hist < prev_hist

    # Filtre de tendance de fond (Murphy) : on n'achète qu'en tendance haussière,
    # on ne shorte qu'en tendance baissière
    uptrend = last_close > last_sma200
    downtrend = last_close < last_sma200

    rsi_oversold = last_rsi < RSI_OVERSOLD_THRESHOLD
    rsi_overbought = last_rsi > RSI_OVERBOUGHT_THRESHOLD

    buy_signal = rsi_oversold and near_lower_band and uptrend
    buy_confidence = "⭐⭐⭐" if (buy_signal and macd_turning_up) else ("⭐⭐" if buy_signal else "")

    short_signal = rsi_overbought and near_upper_band and downtrend
    short_confidence = "⭐⭐⭐" if (short_signal and macd_turning_down) else ("⭐⭐" if short_signal else "")

    # News : uniquement interrogées si un signal technique existe déjà (économise les appels)
    news_score, headlines = (0, [])
    if buy_signal or short_signal:
        news_score, headlines = get_news_sentiment(ticker)

    # "Urgent" = signal technique confirmé + les news vont dans le même sens
    buy_urgent = buy_signal and news_score > 0
    short_urgent = short_signal and news_score < 0

    # Stop loss / Take profit (basés sur l'ATR et le retour à la moyenne mobile 20j)
    buy_stop_loss = round(last_close - ATR_STOP_MULTIPLIER * last_atr, 2)
    buy_take_profit = round(last_mid_bb, 2)
    short_stop_loss = round(last_close + ATR_STOP_MULTIPLIER * last_atr, 2)
    short_take_profit = round(last_mid_bb, 2)

    return {
        "ticker": ticker,
        "price": round(last_close, 2),
        "rsi": round(last_rsi, 1),
        "buy_signal": buy_signal,
        "buy_confidence": buy_confidence,
        "buy_urgent": buy_urgent,
        "buy_stop_loss": buy_stop_loss,
        "buy_take_profit": buy_take_profit,
        "macd_turning_up": macd_turning_up,
        "short_signal": short_signal,
        "short_confidence": short_confidence,
        "short_urgent": short_urgent,
        "short_stop_loss": short_stop_loss,
        "short_take_profit": short_take_profit,
        "macd_turning_down": macd_turning_down,
        "uptrend": uptrend,
        "news_score": news_score,
        "news_headlines": headlines,
    }


# --------------------------------------------------------------------------
# NOTIFICATIONS DISCORD
# --------------------------------------------------------------------------

def send_discord(message: str, webhook_url: str | None):
    if not webhook_url:
        print("[WARN] Webhook Discord manquant pour ce message, non envoyé :")
        print(message)
        return

    payload = {"content": message}
    try:
        r = requests.post(webhook_url, json=payload, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"[ERREUR ENVOI DISCORD] {e}")


# --------------------------------------------------------------------------
# GESTION D'ÉTAT (pour n'alerter qu'à l'ENTRÉE en zone d'achat)
# --------------------------------------------------------------------------

def load_state() -> dict:
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {}


def save_state(state: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


# --------------------------------------------------------------------------
# MAIN
# --------------------------------------------------------------------------

def main():
    mode = os.environ.get("RUN_MODE", "check")  # "check" (temps réel) ou "summary" (récap soir)

    results = []
    for ticker in WATCHLIST:
        r = analyze_ticker(ticker)
        if r:
            results.append(r)

    if not results:
        print("Aucune donnée récupérée, arrêt.")
        return

    if mode == "check":
        # Alerte instantanée uniquement sur NOUVELLE entrée en zone (achat ou short)
        state = load_state()
        new_buy, new_short = [], []
        for r in results:
            prev = state.get(r["ticker"], {"buy": False, "short": False})
            if r["buy_signal"] and not prev.get("buy", False):
                new_buy.append(r)
            if r["short_signal"] and not prev.get("short", False):
                new_short.append(r)
            state[r["ticker"]] = {"buy": r["buy_signal"], "short": r["short_signal"]}
        save_state(state)

        for r in new_buy:
            if r["buy_urgent"]:
                header = "🚨🚨🚨 *OUVRIR POSITION ACHAT MAINTENANT !!!* 🚨🚨🚨"
                news_line = f"News favorables ✅ (score {r['news_score']:+d})\n"
            else:
                header = f"🟢 *OUVRIR POSITION ACHAT* {r['buy_confidence']}"
                news_line = f"News neutres/mitigées (score {r['news_score']:+d})\n"
            msg = (
                f"{header}\n\n"
                f"*{r['ticker']}* — {r['price']}\n"
                f"RSI(14) : {r['rsi']} (survente)\n"
                f"Tendance de fond haussière (prix > MM200) ✅\n"
                f"MACD haussier : {'✅' if r['macd_turning_up'] else '❌'}\n"
                f"{news_line}\n"
                f"🛑 Stop loss : {r['buy_stop_loss']}\n"
                f"🎯 Take profit : {r['buy_take_profit']}\n"
            )
            send_discord(msg, DISCORD_WEBHOOK_BUY or DISCORD_WEBHOOK_SUMMARY)

        for r in new_short:
            if r["short_urgent"]:
                header = "🚨🚨🚨 *OUVRIR POSITION SHORT MAINTENANT !!!* 🚨🚨🚨"
                news_line = f"News défavorables ✅ (score {r['news_score']:+d})\n"
            else:
                header = f"🔴 *OUVRIR POSITION SHORT* {r['short_confidence']}"
                news_line = f"News neutres/mitigées (score {r['news_score']:+d})\n"
            msg = (
                f"{header}\n\n"
                f"*{r['ticker']}* — {r['price']}\n"
                f"RSI(14) : {r['rsi']} (surachat)\n"
                f"Tendance de fond baissière (prix < MM200) ✅\n"
                f"MACD baissier : {'✅' if r['macd_turning_down'] else '❌'}\n"
                f"{news_line}\n"
                f"🛑 Stop loss : {r['short_stop_loss']}\n"
                f"🎯 Take profit : {r['short_take_profit']}\n"
            )
            send_discord(msg, DISCORD_WEBHOOK_SHORT or DISCORD_WEBHOOK_SUMMARY)

        if not new_buy and not new_short:
            print("Aucun nouveau signal.")

    elif mode == "summary":
        # Récap quotidien complet, trié par RSI croissant
        results.sort(key=lambda r: r["rsi"])
        lines = [f"📊 *Récap quotidien* — {datetime.now().strftime('%d/%m/%Y')}\n"]
        for r in results:
            tag = ""
            if r["buy_signal"]:
                tag = " 🟢 ACHAT"
            elif r["short_signal"]:
                tag = " 🔴 SHORT"
            lines.append(f"{r['ticker']}: {r['price']} | RSI {r['rsi']}{tag}")
        send_discord("\n".join(lines), DISCORD_WEBHOOK_SUMMARY)

        # Scan des pépites méconnues (1x/jour, via API Claude)
        opportunities = scan_opportunities()
        for opp in opportunities:
            f = opp["fundamentals"]
            msg = (
                f"💎 *OPPORTUNITÉ POTENTIELLE* — {opp['ticker']} ({f.get('name')})\n"
                f"Secteur : {f.get('sector')} | Capi : {f.get('market_cap')}\n\n"
                f"{opp['analysis']}"
            )
            send_discord(msg, DISCORD_WEBHOOK_OPPORTUNITIES or DISCORD_WEBHOOK_SUMMARY)
        if not opportunities:
            print("Aucune opportunité détectée aujourd'hui parmi les candidats.")


if __name__ == "__main__":
    main()
