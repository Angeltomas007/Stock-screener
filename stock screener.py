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
WATCHLIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "AIR.PA", "MC.PA", "OR.PA",   # exemples actions Euronext Paris
]

RSI_PERIOD = 14
RSI_OVERSOLD_THRESHOLD = 30
BB_PERIOD = 20
BB_STD = 2
MACD_FAST, MACD_SLOW, MACD_SIGNAL = 12, 26, 9

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

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


# --------------------------------------------------------------------------
# ANALYSE D'UNE ACTION
# --------------------------------------------------------------------------

def analyze_ticker(ticker: str) -> dict | None:
    try:
        data = yf.download(ticker, period="9mo", interval="1d", progress=False, auto_adjust=True)
    except Exception as e:
        print(f"[ERREUR] {ticker}: {e}")
        return None

    if data.empty or len(data) < BB_PERIOD + 5:
        print(f"[SKIP] {ticker}: pas assez de données")
        return None

    close = data["Close"]
    if isinstance(close, pd.DataFrame):  # sécurité multi-index yfinance
        close = close.iloc[:, 0]

    rsi = compute_rsi(close)
    macd_line, signal_line, hist = compute_macd(close)
    upper_bb, mid_bb, lower_bb = compute_bollinger(close)

    last_close = float(close.iloc[-1])
    last_rsi = float(rsi.iloc[-1])
    last_lower_bb = float(lower_bb.iloc[-1])
    last_hist = float(hist.iloc[-1])
    prev_hist = float(hist.iloc[-2])

    # Confirmation Bollinger : prix sous ou proche (2%) de la bande basse
    near_lower_band = last_close <= last_lower_bb * 1.02
    # Momentum MACD qui se retourne à la hausse (histogramme remonte)
    macd_turning_up = last_hist > prev_hist

    rsi_oversold = last_rsi < RSI_OVERSOLD_THRESHOLD

    # Signal d'achat = RSI survendu + confirmation Bollinger
    # (le MACD sert de bonus de confiance, pas de condition bloquante)
    buy_signal = rsi_oversold and near_lower_band

    confidence = "⭐⭐⭐" if (buy_signal and macd_turning_up) else ("⭐⭐" if buy_signal else "")

    return {
        "ticker": ticker,
        "price": round(last_close, 2),
        "rsi": round(last_rsi, 1),
        "near_lower_band": near_lower_band,
        "macd_turning_up": macd_turning_up,
        "buy_signal": buy_signal,
        "confidence": confidence,
    }


# --------------------------------------------------------------------------
# NOTIFICATIONS TELEGRAM
# --------------------------------------------------------------------------

def send_telegram(message: str):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        print("[WARN] TELEGRAM_TOKEN / TELEGRAM_CHAT_ID manquants, message non envoyé :")
        print(message)
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }
    try:
        r = requests.post(url, data=payload, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"[ERREUR ENVOI TELEGRAM] {e}")


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
        # Alerte instantanée uniquement sur NOUVELLE entrée en zone d'achat
        state = load_state()
        new_alerts = []
        for r in results:
            was_signal = state.get(r["ticker"], False)
            if r["buy_signal"] and not was_signal:
                new_alerts.append(r)
            state[r["ticker"]] = r["buy_signal"]
        save_state(state)

        for r in new_alerts:
            msg = (
                f"🟢 *SIGNAL D'ACHAT* {r['confidence']}\n\n"
                f"*{r['ticker']}* — {r['price']} \n"
                f"RSI(14) : {r['rsi']} (survente)\n"
                f"Prix proche bande basse Bollinger ✅\n"
                f"MACD haussier : {'✅' if r['macd_turning_up'] else '❌'}\n"
            )
            send_telegram(msg)

        if not new_alerts:
            print("Aucun nouveau signal.")

    elif mode == "summary":
        # Récap quotidien complet, trié par RSI croissant (les plus survendus en premier)
        results.sort(key=lambda r: r["rsi"])
        lines = [f"📊 *Récap quotidien* — {datetime.now().strftime('%d/%m/%Y')}\n"]
        for r in results:
            tag = " 🟢 ACHAT" if r["buy_signal"] else ""
            lines.append(f"{r['ticker']}: {r['price']} | RSI {r['rsi']}{tag}")
        send_telegram("\n".join(lines))


if __name__ == "__main__":
    main()
