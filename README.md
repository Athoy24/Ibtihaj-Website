# Ibtihaj Website

A modern e-commerce website built with React and Vite, featuring Telegram notifications and Google Sheets integration for order management.

## Features

- 🛍️ Product catalog with shopping cart
- 📱 Telegram bot notifications for new orders
- 📊 Google Sheets integration for order tracking
- ⚡ Fast and responsive UI built with React
- 🎨 Modern design with smooth animations

## Tech Stack

- **Frontend**: React 19, React Router
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Integrations**: Telegram Bot API, Google Apps Script

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Telegram Bot Token (get from [@BotFather](https://t.me/BotFather))
- Google Apps Script Web App URL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Athoy24/Ibtihaj-Website.git
cd Ibtihaj-Website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
VITE_GOOGLE_SHEET_URL=your_google_apps_script_url_here
```

5. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and sign in with GitHub
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

For detailed deployment instructions, see the [Vercel Deployment Guide](docs/vercel-deployment-guide.md).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Athoy24/Ibtihaj-Website)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | Yes |
| `VITE_TELEGRAM_CHAT_ID` | Your Telegram chat ID | Yes |
| `VITE_GOOGLE_SHEET_URL` | Google Apps Script Web App URL | Yes |

## Project Structure

```
Ibtihaj-Website/
├── src/
│   ├── components/       # React components
│   ├── context/          # React context (CartContext)
│   ├── pages/            # Page components
│   └── App.jsx           # Main app component
├── public/               # Static assets
├── .env.example          # Environment variables template
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.
