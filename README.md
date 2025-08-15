# 📦 Goods Monitoring Bot

A **powerful Telegram bot** built with **TypeScript** that keeps track of goods, prices, and availability in real time.  
It automatically parses data from your chosen sources, stores it in **PostgreSQL**, and alerts you when better deals are found — including the ability to search for cheaper prices **by category** (e.g., books, tools, electronics).

<div align="center">
  <img src="https://github.com/user-attachments/assets/a8fe6edf-7a46-4316-8b1b-1a391fc1917c" alt="Bot Screenshot 1" width="40%"/>
  <img src="https://github.com/user-attachments/assets/7292ad94-f7c6-4399-b62c-f2ebee82fd46" alt="Bot Screenshot 2" width="34%"/>
</div>

<div align="center">
  <video src="https://github.com/user-attachments/assets/9363576b-1d01-4f05-bc4b-98f5c35746a2" width="80%" autoplay loop muted playsinline />
</div>



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

