# Samin — Handcrafted Candle Studio

Samin is a bilingual (Persian / English) web storefront for a handcrafted candle brand. It showcases the product catalogue, the candle-making process, upcoming events, a gallery, and a contact page — all served as a single-page application inside a Laravel backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 18, React Router 6 |
| Styling | Tailwind CSS v4, tw-animate-css |
| Icons | Lucide React |
| Slider | Swiper 12 |
| Build tool | Vite 7 + laravel-vite-plugin |
| Runtime | Docker (PHP-FPM, Nginx, Redis) |

---

## Project Structure

```
resources/
  application/        # JavaScript entry point & React source
    app.jsx           # Laravel Vite entry — mounts React
    client/           # Full React SPA
      App.jsx         # Router, ThemeProvider, LanguageProvider
      components/     # Navigation, Footer, Candle, etc.
      contexts/       # LanguageContext, ThemeContext
      pages/          # Main, Contact, Gallery, Events, GetTicket, RegistrationEvent
      translations/   # fa.json, en.json
  views/
    home.blade.php    # SPA shell (single HTML file)
public/
  fonts/              # YekanBakh, Vazirmatn
  images/             # Product & content images
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Make](https://www.gnu.org/software/make/)

---

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services  (backend + frontend + redis)
make up

# 3. Generate app key (first time only)
make key

# 4. Run database migrations (first time only)
make migrate
```

Open **http://localhost:8080** in your browser.

Vite dev server with HMR runs automatically on **http://localhost:5173**.

---

## Common Commands

```bash
make up               # Start all services
make down             # Stop & remove containers
make restart          # Restart all services
make logs             # Follow all logs
make logs-front       # Follow Vite dev server logs
make shell            # Shell into PHP container
make front-shell      # Shell into Node container

make artisan cmd="route:list"   # Run any artisan command
make npm cmd="install lodash"   # Run any npm command

make migrate          # Run migrations
make fresh            # Fresh migrate + seed
make test             # Run PHPUnit tests
make front-build      # Build frontend for production
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `8080` | Nginx public port |
| `VITE_PORT` | `5173` | Vite dev server port |
| `VITE_HMR_HOST` | `localhost` | HMR websocket host |
| `CHOKIDAR_USEPOLLING` | `true` | File watching inside Docker |

---

## Features

- **Bilingual UI** — seamless Persian / English switching with RTL support
- **Dark / Light theme** — persisted via React context
- **Product catalogue** — categorised candle collection with a scroll fade effect
- **Process timeline** — step-by-step candle-making story
- **Events & ticketing** — event listing, registration, and ticket download pages
- **Gallery** — photo showcase
- **Contact page** — enquiry form

---

## License

MIT

