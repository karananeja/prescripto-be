# Prescripto — Backend API

Express + TypeScript API for the Prescripto healthcare booking app. It serves **admin**, **doctor**, and **user** flows with MongoDB, JWT auth, Cloudinary uploads, and Razorpay payments.

## Stack

- **Runtime:** Node.js  
- **Framework:** Express 4  
- **Language:** TypeScript  
- **Database:** MongoDB (Mongoose)  
- **Auth:** JWT (`jsonwebtoken`), bcrypt  
- **Media:** Cloudinary  
- **Payments:** Razorpay  
- **Validation:** Zod  

## Prerequisites

- Node.js (LTS recommended)  
- MongoDB Atlas (or compatible cluster) credentials  
- Cloudinary and Razorpay accounts (for image uploads and payments)  

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root (see [Environment variables](#environment-variables)).

3. **MongoDB connection string:** The Atlas host is set in `src/index.ts`. Update the URI if your cluster host differs from `cluster0.zvcge.mongodb.net`, or keep `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` aligned with that cluster.

4. Build and run:

   ```bash
   npm run build
   npm start
   ```

   For development with file watching (requires [nodemon](https://www.npmjs.com/package/nodemon), install globally or as a dev dependency):

   ```bash
   npm run dev
   ```

The server listens on **`PORT`** from `.env`, or **3000** by default.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (optional, default `3000`) |
| `DB_USERNAME` | MongoDB Atlas username |
| `DB_PASSWORD` | MongoDB Atlas password |
| `DB_NAME` | MongoDB database name |
| `JWT_SECRET` | Secret for signing and verifying JWTs |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `CURRENCY` | Currency code used for payments (e.g. `INR`) |

## API overview

Base paths:

- `/api/v1/admin` — admin panel  
- `/api/v1/doctor` — doctor portal  
- `/api/v1/user` — patient app  

### User (`/api/v1/user`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/register` | — |
| POST | `/login` | — |
| GET | `/get-user-info` | User JWT |
| PUT | `/update-user-info` | User JWT (multipart: profile image) |
| POST | `/book-appointment` | User JWT |
| GET | `/get-appointments` | User JWT |
| POST | `/cancel-appointment` | User JWT |
| POST | `/make-payment` | User JWT |
| POST | `/verify-payment` | User JWT |

### Doctor (`/api/v1/doctor`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/get-all-doctors` | — |
| POST | `/login` | — |
| GET | `/get-doctor-info` | Doctor JWT |
| PUT | `/update-doctor-info` | Doctor JWT |
| GET | `/get-appointments` | Doctor JWT |
| POST | `/complete-appointment` | Doctor JWT |
| POST | `/cancel-appointment` | Doctor JWT |
| GET | `/get-dashboard-data` | Doctor JWT |

### Admin (`/api/v1/admin`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/add-doctor` | Admin JWT (multipart: image) |
| POST | `/login` | — |
| GET | `/get-all-doctors` | Admin JWT |
| POST | `/change-availability` | Admin JWT |
| GET | `/get-appointments` | Admin JWT |
| POST | `/cancel-appointment` | Admin JWT |
| GET | `/get-dashboard-data` | Admin JWT |

Any other route returns **404** `Not found`. Errors go through the global error middleware.

## Project layout

```
src/
  config/          # MongoDB, Cloudinary
  controller/      # Route handlers
  middlewares/     # Auth, uploads, errors
  models/          # Mongoose schemas
  routes/          # Express routers
  utils/           # Helpers, validation
  index.ts         # App entry
```

## Scripts

| Script | Command |
|--------|---------|
| `build` | `npx tsc` — compile to `dist/` |
| `start` | `node dist/index.js` — production |
| `dev` | `nodemon src/index.ts` — development |

## License

ISC

## Author

Karan Aneja
