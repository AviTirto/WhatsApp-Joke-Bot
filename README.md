# 😂 WhatsApp Roast & Joke Bot

Have you ever wanted to *finally settle* who the funniest person in your WhatsApp group is?  
Whether it's the best roaster or dad joker, this bot can help your group chat find the answer.

## 🧠 Features

Built using `venom-bot` and `puppeteer`, this bot lets people:
- Submit roasts and jokes
- Vote on each other's submissions
- Track average scores per user
- Automatically rank the funniest people in the chat

The bot handles voting, stops people from voting for themselves (cheaters!), and keeps everything fair and fun — no spreadsheets or moderation needed.

---

## 🚀 Commands

| Command        | Description                                   |
|----------------|-----------------------------------------------|
| `#joke`        | Submit a joke                                  |
| `#roast`       | Submit a roast                                 |
| `#vote <code> <1-10>` | Vote on a joke/roast using its code       |
| `#rank`        | Show top joke/roast submitters (by average)    |
| `#joker`       | Show command list                              |

---

## 🛠️ Local Setup

### 1. Clone the repo (or copy the code into a directory)
```bash
git clone <your-repo-url>
cd venom-whatsapp-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the bot
```bash
node index.js
```
> You will see a QR code. Scan it with your WhatsApp to authenticate the session.


---


## ☁️ Deploying on DigitalOcean (or any Linux VPS)

### 1. SSH into your server
```bash
ssh root@your-server-ip
```

### 2. Set up the project
```bash
apt update
apt install nodejs npm -y

# Optional: install git and clone your project
apt install git -y
git clone <your-repo-url>
cd venom-whatsapp-bot
npm install
```

### 3. Install and use PM2 to keep bot running
```bash
npm install -g pm2
pm2 start index.js --name venom-bot
pm2 save
```

### 4. View logs
```bash
pm2 logs venom-bot
```

### 5. Start on reboot (optional)
```bash
pm2 startup
```

---

## 🧼 Notes
* All data is stored in memory. Restarting the bot resets scores.

* This project uses `puppeteer` in headful mode for QR scanning.

* Use responsibly. WhatsApp bots are subject to WhatsApp’s Terms of Service.

---

## 💡 Credits
Built using:
* [venom-bot](https://github.com/orkestral/venom)

* [puppeteer](https://pptr.dev/)





