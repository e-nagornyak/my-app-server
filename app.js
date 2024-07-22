require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const ping = require('ping');
const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 5050;
const IP_TO_PING = process.env.IP_TO_PING;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const NOTIFICATION_TIMEOUT_M = parseInt(process.env.NOTIFICATION_TIMEOUT_M, 10) || 0.1;

if (!IP_TO_PING || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Необхідні змінні середовища не встановлені');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const app = express();

// IMPORT ROUTES
const gridRoute = require('./routes/grid');

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(compression());

// ROUTES
app.use('/api/grid', gridRoute);

// Ping service
let lastStatus = null;

function sendTelegramMessage(message) {
  bot.sendMessage(TELEGRAM_CHAT_ID, message)
    .catch(error => console.error('Помилка відправки повідомлення в Telegram:', error));
}

function pingService() {
  ping.sys.probe(IP_TO_PING, (isAlive) => {
    if (!isAlive && lastStatus !== false) {
      const message = `Бляха, світла дома нема походу`;
      sendTelegramMessage(message);
      lastStatus = false;
    } else if (isAlive && lastStatus !== true) {
      const message = `Ура! Світло є!`;
      sendTelegramMessage(message);
      lastStatus = true;
    }
  });
}

// Run ping service every NOTIFICATION_TIMEOUT_M minutes
const intervalMs = NOTIFICATION_TIMEOUT_M * 60 * 1000;
setInterval(pingService, intervalMs);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
  console.log(`Ping service started for IP: ${IP_TO_PING}`);
  console.log(`Ping interval set to ${NOTIFICATION_TIMEOUT_M} minutes`);
});
