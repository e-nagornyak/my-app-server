module.exports = {
  apps : [{
    name: "ping-service",
    script: "./app.js",
    watch: true,
    env: {
      "PORT": 5050,
      "IP_TO_PING": "IP_ADDRESS_TO_PING",
      "TELEGRAM_BOT_TOKEN": "YOUR_TELEGRAM_BOT_TOKEN",
      "TELEGRAM_CHAT_ID": "YOUR_TELEGRAM_CHAT_ID",
      "NOTIFICATION_TIMEOUT_M": 5
    }
  }]
}
