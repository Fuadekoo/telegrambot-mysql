require("dotenv").config();
const { Bot } = require("grammy");
const mysql = require("mysql2");

// Initialize the bot with the token from the .env file
const bot = new Bot(process.env.BOT_TOKEN);

// Channel ID where the bot is an admin
const CHANNEL_ID = process.env.CHANNEL_ID;

// Create a connection to the database
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

// Handle the /start command
bot.command("start", (ctx) => {
  ctx.reply(
    "Hello! I am your new Telegram bot powered by grammY. How can I help you?"
  );
});

// Handle text messages
bot.on("message:text", (ctx) => {
  ctx.reply(`You said: ${ctx.message.text}`);
});

// Function to check for new users and send a message
let lastCheckedId = 0;

function checkForNewUsers() {
  const query = "SELECT * FROM properties WHERE id > ? ORDER BY id ASC"; // Replace 'user' with your actual table name
  connection.query(query, [lastCheckedId], (err, results) => {
    if (err) {
      console.error("Failed to fetch data from the database.", err);
      return;
    }

    if (results.length > 0) {
      results.forEach((row) => {
        const message = `New user created: ${JSON.stringify(row)}`;
        bot.api
          .sendMessage(CHANNEL_ID, message)
          .then(() => {
            console.log("New user message sent to the channel!");
          })
          .catch((err) => {
            console.error(
              "Failed to send new user message to the channel.",
              err
            );
          });
        lastCheckedId = row.id;
      });
    }
  });
}

// Start the bot and send a "Good morning, students!" message
bot
  .start()
  .then(() => {
    console.log("Bot started successfully.");
    return bot.api.sendMessage(CHANNEL_ID, "Good morning, students!");
  })
  .then(() => {
    console.log("Good morning message sent to the channel!");
  })
  .catch((err) => {
    console.error(
      "Failed to start the bot or send the good morning message.",
      err
    );
  });

// Poll the database for new users every 10 seconds
setInterval(checkForNewUsers, 10000);

console.log("Bot is running...");
