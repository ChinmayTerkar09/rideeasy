# 🚗 RideEasy — Bike & Car Rental Platform

A full-stack bike and car rental system with AI-powered pricing and chatbot.

**Live Frontend:** https://chinmayterkar09.github.io/rideeasy

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS, Claude AI API
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT
- **Payments:** Razorpay
- **SMS:** Twilio
- **Deploy:** GitHub Pages (frontend) + Vercel Serverless (backend)

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login user |
| GET  | /api/auth/me | Get current user |

### Vehicles
| Method | Route | Description |
|--------|-------|-------------|
| GET  | /api/vehicles | List all vehicles |
| GET  | /api/vehicles/:id | Get single vehicle |
| POST | /api/vehicles | List a vehicle (owner) |
| PUT  | /api/vehicles/:id | Update vehicle (owner) |
| DELETE | /api/vehicles/:id | Remove vehicle (owner) |
| GET  | /api/vehicles/owner/my | Owner's vehicles |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/bookings | Create booking |
| GET  | /api/bookings/my | My bookings |
| GET  | /api/bookings/all | All bookings |
| PUT  | /api/bookings/:id/cancel | Cancel booking |
| PUT  | /api/bookings/:id/complete | Complete booking |

### Reviews
| Method | Route | Description |
|--------|-------|-------------|
| GET  | /api/reviews/:vehicleId | Get vehicle reviews |
| POST | /api/reviews/:vehicleId | Add review |
| DELETE | /api/reviews/:id | Delete review |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/payment/order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment |
| POST | /api/payment/refund | Refund payment |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/notify/booking-confirm | SMS confirmation |
| POST | /api/notify/booking-reminder | 1hr reminder SMS |
| POST | /api/notify/owner-alert | Alert owner on booking |

## Setup

```bash
# Clone and install
git clone https://github.com/ChinmayTerkar09/rideeasy.git
cd rideeasy
npm install

# Configure environment
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, Razorpay keys, Twilio credentials

# Run locally
npm run dev
```

## Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
# Add environment variables in Vercel dashboard
```
