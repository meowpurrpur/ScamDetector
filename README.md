# ScamDetector

A Discord bot that detects cryptocurrency scams in images, and more in the future.

- Scans images for scam content
- Uses OCR to detect suspicious text and patterns
- Automatically kicks users, and sends them a DM with a link to rejoin once their account is secure

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