# AAZ Companion

A web-based companion app for the solo tabletop RPG **Alone Against the Zone** by Alexey Aparin and Andrea Sfiligoi (Ganesha Games). Currently in **BETA**.

## Disclaimer

This companion app is unofficial and not affiliated with or endorsed by Ganesha Games.

## Features

- **Zone Management**: Create a new zone or load a previously saved one from a JSON file
- **Hex Grid Map**: Track your exploration on an interactive hex grid, with terrain types (forest, mountain, water, bridge), doors, encounter markers, and auto-generation of random layouts
- **Operative Sheet**: Manage your operative's stats — attack, defense, life, rad resistance, XP, food, money, equipment, skills, weapons (with ammo and rust tracking), and notes; also track your Echo
- **Encounter Tracker**: Log encounters with level, count, and attacks per round
- **Surge Warnings**: Visual 12-step tracker (green / yellow / red) for zone surge escalation
- **Dice Roller**: Roll d6, d66, 2d6, or 3d6 with animated floating dice
- **Path Tracking**: Record your path through the zone
- **Adventure Log**: Timestamped log entries for session notes
- **Dark Mode**: Toggle light/dark theme
- **Persistent Storage**: Everything auto-saves to localStorage per zone
- **Save/Load**: Export and import a zone as a JSON backup file

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (`npm install --global yarn`)

### Installation

```bash
git clone https://github.com/sergesarapov/aaz-companion.git
cd aaz-companion
yarn
yarn start
```

Open `http://localhost:3000` in your browser.

### Build

```bash
yarn build
```

## Tech Stack

- React 18 + TypeScript
- React Router
- Tailwind CSS
- Vercel (hosting + analytics)

## Contributing

Pull requests are welcome. Please open an issue first for larger changes.

## License

Open source.

---

Support the creators — buy **Alone Against the Zone** from [ganeshagames.net](https://www.ganeshagames.net/).
