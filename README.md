# ScamDetector

A Discord bot that detects cryptocurrency scams in images, and more in the future.

- Scans images for scam content
- Uses OCR to detect suspicious text and patterns
- Automatically kicks users, and sends them a DM with a link to rejoin once their account is secure

## Add to your server

If you do not want to host your own instance of the bot, you can use the one hosted and managed by me! The bot should have 100% uptime so don't worry.

-> [Authorization Link](https://discord.com/oauth2/authorize?client_id=1529648697120657508)

## Setup

1. Clone repo

```bash
git clone https://git.imtheo.lol/theo/ScamDetector
cd ScamDetector
```

2. Install packages

```bash
pnpm install
```

3. Edit .env

```bash
cp .env.example .env
nano .env
```

4. Start

To run as dev:

```bash
pnpm run dev
```

To run normally:

```bash
pnpm run build
pnpm run start
```