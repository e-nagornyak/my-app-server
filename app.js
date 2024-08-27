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
const NOTIFICATION_TIMEOUT_M = parseInt(process.env.NOTIFICATION_TIMEOUT_M, 10) || 5;

if (!IP_TO_PING || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Required environment variables not set');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(compression());


// Ping service
let lastStatus = null;

function sendTelegramMessage(message) {
  bot.sendMessage(TELEGRAM_CHAT_ID, message)
    .catch(error => console.error('Error sending message in Telegram:', error));
}

function pingService() {
  ping.sys.probe(IP_TO_PING, (isAlive) => {
    if (!isAlive && lastStatus !== false) {
      sendTelegramMessage('Блять, there is no light at home');
      lastStatus = false;
    } else if (isAlive && lastStatus !== true) {
      sendTelegramMessage('Ура! There is light!');
      lastStatus = true;
    }
  });
}
// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'іів')
//     .catch(error => console.error('Error sending message:', error));
// });
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   console.log('messa')
//   // Перевірка, чи це повідомлення з потрібної групи
//   if (chatId.toString() === TELEGRAM_CHAT_ID) {
//     // Дія для повідомлень із конкретної групи
//     bot.sendMessage(chatId, 'Я почув повідомлення з вашої групи!')
//       .catch(error => console.error('Error sending message:', error));
//   }
// });

// Обробка команди "status"
bot.onText(/status/, (msg) => {
  const chatId = msg.chat.id;

  ping.sys.probe(IP_TO_PING, (isAlive) => {
    const responseMessage = isAlive ? 'Всьо пучком' : 'Не мєчтай';
    bot.sendMessage(chatId, responseMessage)
      .catch(error => console.error('Error sending message:', error));
  });
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
});

// Run ping service every NOTIFICATION_TIMEOUT_M minutes
const intervalMs = NOTIFICATION_TIMEOUT_M * 60 * 1000;
setInterval(pingService, intervalMs);

app.listen(PORT, () => {
  // bot.startPolling()
  console.log(`Server listening on port ${PORT}!`);
  console.log(`Ping service started for IP: ${IP_TO_PING}`);
  console.log(`Ping interval set to ${NOTIFICATION_TIMEOUT_M} minutes`);
});
