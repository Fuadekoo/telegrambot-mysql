require("dotenv").config();
const mysql = require("mysql");
const { Bot } = require("grammy");

// MySQL connection setup
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

// Telegram bot setup
const bot = new Bot(process.env.BOT_TOKEN);
const channelId = process.env.CHANNEL_ID;

// Function to send message to Telegram channel
function sendMessageToChannel(message) {
  bot.api.sendMessage(channelId, message).catch(console.error);
}

// Monitor MySQL table for new inserts
function monitorTable() {
  connection.query(
    "SELECT * FROM user ORDER BY id DESC LIMIT 1",
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const latestRow = results[0];
        const message = `New entry: ${JSON.stringify(latestRow)}`;
        sendMessageToChannel(message);
      }
    }
  );
}

// Polling interval to check for new inserts
setInterval(monitorTable, 5000);
