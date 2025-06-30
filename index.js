const venom = require('venom-bot');
const puppeteer = require('puppeteer');

// Patch Puppeteer launch options
const originalLaunch = puppeteer.launch;
puppeteer.launch = function (options = {}) {
  options.headless = 'new';
  options.args = options.args || [];
  options.args = options.args.filter(arg => !arg.startsWith('--headless'));
  options.args.push('--headless=new');
  return originalLaunch.call(this, options);
};

const jokeStats = {};
const roastStats = {};

venom
  .create({
    session: 'session-name',
    puppeteerOptions: {
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })
  .then(startBot)
  .catch(console.error);

function startBot(client) {
  const seenMessages = new Set();

  client.onAnyMessage(async (message) => {
    if (seenMessages.has(message.id)) return;
    seenMessages.add(message.id);

    const senderId = message.sender?.id || message.author || 'unknown';
    const chatId = message.chatId || message.from;
    const content = message.body?.trim();
    if (!content) return;

    const rawName = message.sender?.pushname || senderId.replace('@c.us', '');
    const senderName = rawName.split(/\s+/)[0]; // first word only

    console.log(`[${chatId}] ${senderName} (${message.fromMe ? 'me' : 'user'}): ${content}`);

    // === #joke ===
    if (content.toLowerCase().startsWith('#joke ')) {
      const jokeText = content.slice(6).trim();
      if (!jokeText) return client.sendText(chatId, 'Please write a joke after #joke.');

      const code = `${senderName.toLowerCase()}-joke`;
      if (!jokeStats[code]) {
        jokeStats[code] = { name: senderName, totalScore: 0, count: 0, voters: {} };
      }

      await client.sendText(chatId, `😂 Joke by *${senderName}* added! Vote using: #vote ${code} <1-10>`);
      return;
    }

    // === #roast ===
    if (content.toLowerCase().startsWith('#roast ')) {
      const roastText = content.slice(7).trim();
      if (!roastText) return client.sendText(chatId, 'Please write a roast after #roast.');

      const code = `${senderName.toLowerCase()}-roast`;
      if (!roastStats[code]) {
        roastStats[code] = { name: senderName, totalScore: 0, count: 0, voters: {} };
      }

      await client.sendText(chatId, `🔥 Roast by *${senderName}* added! Vote using: #vote ${code} <1-10>`);
      return;
    }

    // === #vote ===
    if (content.toLowerCase().startsWith('#vote ')) {
      const parts = content.split(' ');
      if (parts.length !== 3) return client.sendText(chatId, 'Invalid vote format. Use: #vote <code> <1-10>');

      const code = parts[1].toLowerCase();
      const score = parseInt(parts[2], 10);
      if (isNaN(score) || score < 1 || score > 10) {
        return client.sendText(chatId, 'Vote score must be a number from 1 to 10.');
      }

      const store = code.includes('-joke') ? jokeStats : code.includes('-roast') ? roastStats : null;
      if (!store || !store[code]) return client.sendText(chatId, `Code ${code} not found.`);

      if (store[code].name.toLowerCase() === senderName.toLowerCase()) {
        return client.sendText(chatId, '❌ You can’t vote on your own submission!');
      }

      if (store[code].voters[senderId]) {
        store[code].totalScore -= store[code].voters[senderId]; // remove old
        store[code].count -= 1;
      }

      store[code].voters[senderId] = score;
      store[code].totalScore += score;
      store[code].count += 1;

      const avg = store[code].totalScore / store[code].count;
      return client.sendText(
        chatId,
        `✅ *${senderName}* voted ${score} on *${code}*! Total votes: ${store[code].count}, avg: ${avg.toFixed(2)}`
      );
    }

    // === #rank ===
    if (content.toLowerCase() === '#rank') {
      const reply = buildRankReply(jokeStats, roastStats);
      return client.sendText(chatId, reply || 'No entries yet!');
    }

    // === Help ===
    if (content.toLowerCase() === '#joker') {
      return client.sendText(
        chatId,
        '👋 Commands:\n• `#joke <your joke>`\n• `#roast <your roast>`\n• `#vote <code> <1-10>`\n• `#rank` to see top jokes and roasts'
      );
    }
  });
}

function buildRankReply(jokes, roasts) {
  const formatBoard = (data, label) => {
    const entries = Object.entries(data)
      .filter(([_, obj]) => obj.count > 0)
      .map(([code, obj]) => ({
        name: obj.name,
        avg: obj.totalScore / obj.count,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    if (entries.length === 0) return `*${label}*\nNo submissions yet.\n`;

    let txt = `*${label}*\n`;
    entries.forEach((e, i) => {
      txt += `${i + 1}. ${e.name}: ${e.avg.toFixed(2)}\n`;
    });
    return txt;
  };

  return `${formatBoard(jokes, '😂 Top Jokes')}\n${formatBoard(roasts, '🔥 Top Roasts')}`;
}
