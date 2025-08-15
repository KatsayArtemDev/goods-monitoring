# goods-monitoring

A **powerful Telegram bot** built with **TypeScript** that keeps track of goods, prices, and availability in real time.  
It automatically parses data from your chosen sources, stores it in **PostgreSQL**, and alerts you when better deals are found — including the ability to search for cheaper prices **by category** (e.g., books, tools, electronics).

---

## 🚀 Key Features

- **Regular Monitoring** – Continuously parses your chosen goods list to track price changes and stock status.
- **Category-based Cheapest Price Search** – Find the lowest price **in a specific section** like “Books”, “Tools”, “Electronics”, etc.
- **Instant Telegram Notifications** – Get alerts the moment a better price is detected.
- **Flexible Parsing Rules** – Supports parsing from HTML pages, APIs, or custom data feeds.
- **Detailed Price History** – View past prices to analyze trends over time.
- **Custom Commands** – Control the bot directly in Telegram with intuitive commands.
- **Multi-User Support** – Each user can set their own monitored categories and preferences.
- **PostgreSQL Powered** – All goods, categories, and price histories are stored securely in a relational database for fast lookups.

---

## 📋 Example Use Cases

- Track the price of a single product and get notified on price drops.
- Monitor entire categories (e.g., all "Books") and instantly see which item is the cheapest today.
- Compare prices across multiple vendors.
- Maintain a historical record of how product prices change over time.

---

## 📦 Requirements

- **Node.js** ≥ 20
- **PostgreSQL** ≥ 14
- A **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)

---

## ⚙️ Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/KatsayArtemDev/goods-monitoring.git
   cd goods-monitoring
