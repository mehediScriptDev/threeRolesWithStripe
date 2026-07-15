# GearUp API

Sports & outdoor gear rental backend.

Roles: **Customer** | **Provider** | **Admin**

Base URL (local): `http://localhost:3000`

Use **Postman** / **Thunder Client** / **Insomnia**.  
For protected routes, add header:

```text
Authorization: Bearer <your_jwt_token>
```

---

## Setup (local)

```bash
npm install
npm run setup
npm run dev
```

Admin seed account:

| Field    | Value             |
|----------|-------------------|
| email    | `admin@gearup.com` |
| password | `admin123`         |

---

## Deploy (Render — easiest)

Do **not** use Vercel for this project. This is a normal Express API. Use [Render](https://render.com).

### Steps

1. Push your code to GitHub (already done).
2. Go to [https://render.com](https://render.com) → **New** → **Web Service**.
3. Connect the `threeRolesWithStripe` repo.
4. Settings:

| Setting | Value |
|---------|--------|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance | Free |

5. Add **Environment Variables**:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `file:./prisma/dev.db` |
| `JWT_SECRET` | any long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `APP_URL` | your Render URL (set after first deploy, e.g. `https://gearup-xxx.onrender.com`) |
| `STRIPE_SECRET_KEY` | your `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | your `pk_test_...` |
| `SSLCOMMERZ_IS_SANDBOX` | `true` |

6. Click **Create Web Service** and wait.
7. Open: `https://your-service.onrender.com/health`

### Notes

- Free Render services sleep after idle; first request can take ~30–60s.
- SQLite file can reset when the free instance restarts (fine for assignment demo).
- After deploy, use your Render URL in Postman instead of `localhost:3000`.

### Optional: public URL without cloud deploy

Keep running locally, then:

```bash
npx ngrok http 3000
```

Share the ngrok HTTPS URL for testing.

---

## Suggested test order

Follow this order so IDs and status flow work correctly.

1. Login as admin → create category  
2. Register provider → add gear  
3. Register customer → place rental  
4. Provider confirms order  
5. Customer pays  
6. Provider: picked up → returned  
7. Customer leaves review  
8. Admin views users / gear / rentals  

Save these IDs while testing:

- `categoryId`
- `gearId`
- `rentalId`
- `paymentId`
- tokens for admin / provider / customer

---

## 1. Health

### `GET /`

```text
http://localhost:3000/
```

### `GET /health`

```text
http://localhost:3000/health
```

---

## 2. Auth

### `POST /api/auth/register` (Customer)

```json
{
  "name": "Ali Customer",
  "email": "ali@mail.com",
  "password": "123456",
  "role": "CUSTOMER"
}
```

### `POST /api/auth/register` (Provider)

```json
{
  "name": "Rahim Provider",
  "email": "rahim@mail.com",
  "password": "123456",
  "role": "PROVIDER"
}
```

> Role must be `CUSTOMER` or `PROVIDER` only.

### `POST /api/auth/login`

```json
{
  "email": "ali@mail.com",
  "password": "123456"
}
```

Copy `data.token` from the response.

### `GET /api/auth/me`

Headers:

```text
Authorization: Bearer <token>
```

---

## 3. Admin — Categories & users

Login as admin first:

```json
{
  "email": "admin@gearup.com",
  "password": "admin123"
}
```

Use admin token for all `/api/admin/*` routes.

### `POST /api/admin/categories`

```json
{
  "name": "Cycling",
  "description": "Bikes and cycling gear"
}
```

Save `data.id` → `categoryId`

### `PUT /api/admin/categories/:id`

```json
{
  "name": "Cycling",
  "description": "Updated description"
}
```

### `DELETE /api/admin/categories/:id`

Only works if no gear is linked to that category.

### `GET /api/admin/users`

### `PATCH /api/admin/users/:id`

```json
{
  "status": "SUSPENDED"
}
```

or

```json
{
  "status": "ACTIVE"
}
```

### `GET /api/admin/gear`

### `GET /api/admin/rentals`

---

## 4. Public — Categories & gear

No auth needed.

### `GET /api/categories`

### `GET /api/gear`

Optional query filters:

```text
GET /api/gear?category=<categoryId-or-slug>
GET /api/gear?brand=Giant
GET /api/gear?minPrice=10&maxPrice=100
GET /api/gear?available=true
```

### `GET /api/gear/:id`

```text
GET /api/gear/<gearId>
```

---

## 5. Provider — Inventory

Use **provider** token.

### `POST /api/provider/gear`

```json
{
  "categoryId": "<categoryId>",
  "name": "Mountain Bike",
  "description": "21-speed trail bike",
  "brand": "Giant",
  "pricePerDay": 25,
  "stock": 3,
  "isAvailable": true,
  "specifications": {
    "size": "M",
    "weight": "14kg"
  },
  "imageUrl": "https://example.com/bike.jpg"
}
```

Save `data.id` → `gearId`

### `GET /api/provider/gear`

### `PUT /api/provider/gear/:id`

```json
{
  "pricePerDay": 30,
  "stock": 5
}
```

### `DELETE /api/provider/gear/:id`

---

## 6. Customer — Rentals

Use **customer** token.

### `POST /api/rentals`

```json
{
  "startDate": "2026-07-20",
  "endDate": "2026-07-23",
  "items": [
    {
      "gearItemId": "<gearId>",
      "quantity": 1
    }
  ]
}
```

Save `data.id` → `rentalId`  
Status starts as `PLACED`

### `GET /api/rentals`

### `GET /api/rentals/:id`

```text
GET /api/rentals/<rentalId>
```

### `PATCH /api/rentals/:id/cancel`

Only if status is still `PLACED`.

---

## 7. Provider — Orders

Use **provider** token.

### `GET /api/provider/orders`

### `PATCH /api/provider/orders/:id`

Confirm the order:

```json
{
  "status": "CONFIRMED"
}
```

Allowed provider transitions:

| Current status | Can change to |
|----------------|---------------|
| `PLACED`       | `CONFIRMED`   |
| `PAID`         | `PICKED_UP`   |
| `PICKED_UP`    | `RETURNED`    |

---

## 8. Customer — Payments

Use **customer** token.  
Order must be `CONFIRMED` first.

Add payment keys in `.env` before testing real Stripe / SSLCommerz:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...
SSLCOMMERZ_IS_SANDBOX=true
```

### `POST /api/payments/create` (Stripe)

```json
{
  "rentalOrderId": "<rentalId>",
  "method": "STRIPE"
}
```

Response includes `providerData.clientSecret`.

### `POST /api/payments/create` (SSLCommerz)

```json
{
  "rentalOrderId": "<rentalId>",
  "method": "SSLCOMMERZ"
}
```

Response includes `providerData.gatewayUrl`.

Save `data.payment.id` → `paymentId`

### `POST /api/payments/confirm`

After the payment succeeds with the provider:

```json
{
  "paymentId": "<paymentId>"
}
```

For SSLCommerz you can also send:

```json
{
  "paymentId": "<paymentId>",
  "transactionId": "<ssl_tran_id>"
}
```

On success: payment → `COMPLETED`, rental → `PAID`

### `GET /api/payments`

### `GET /api/payments/:id`

```text
GET /api/payments/<paymentId>
```

---

## 9. Finish rental + review

### Provider marks picked up

```json
{
  "status": "PICKED_UP"
}
```

`PATCH /api/provider/orders/<rentalId>`

### Provider marks returned

```json
{
  "status": "RETURNED"
}
```

`PATCH /api/provider/orders/<rentalId>`

### Customer leaves review

`POST /api/reviews` (customer token)

```json
{
  "rentalOrderId": "<rentalId>",
  "gearItemId": "<gearId>",
  "rating": 5,
  "comment": "Great bike, smooth ride"
}
```

Rules:

- order must be `RETURNED`
- rating must be `1` to `5`
- one review per gear per rental

---

## Full status flow

```text
PLACED
  ├─ customer cancels → CANCELLED
  └─ provider confirms → CONFIRMED
                           └─ payment success → PAID
                                                 └─ PICKED_UP
                                                      └─ RETURNED → review
```

---

## Quick endpoint checklist

### Auth
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `GET /api/auth/me`

### Public
- [ ] `GET /api/categories`
- [ ] `GET /api/gear`
- [ ] `GET /api/gear/:id`

### Provider
- [ ] `POST /api/provider/gear`
- [ ] `GET /api/provider/gear`
- [ ] `PUT /api/provider/gear/:id`
- [ ] `DELETE /api/provider/gear/:id`
- [ ] `GET /api/provider/orders`
- [ ] `PATCH /api/provider/orders/:id`

### Customer rentals
- [ ] `POST /api/rentals`
- [ ] `GET /api/rentals`
- [ ] `GET /api/rentals/:id`
- [ ] `PATCH /api/rentals/:id/cancel`

### Payments
- [ ] `POST /api/payments/create`
- [ ] `POST /api/payments/confirm`
- [ ] `GET /api/payments`
- [ ] `GET /api/payments/:id`

### Reviews
- [ ] `POST /api/reviews`

### Admin
- [ ] `GET /api/admin/users`
- [ ] `PATCH /api/admin/users/:id`
- [ ] `GET /api/admin/gear`
- [ ] `GET /api/admin/rentals`
- [ ] `POST /api/admin/categories`
- [ ] `PUT /api/admin/categories/:id`
- [ ] `DELETE /api/admin/categories/:id`

---

## Tech stack

- Node.js + Express + TypeScript
- Prisma ORM + SQLite (`prisma/dev.db`)
- JWT auth + role middleware
- Stripe + SSLCommerz payments
- Module pattern: `routes → controller → service → prisma`

---

## Useful scripts

| Command         | What it does              |
|-----------------|---------------------------|
| `npm run setup` | Create DB tables + seed   |
| `npm run dev`   | Start server (watch mode) |
| `npm run db:push` | Sync schema to DB       |
| `npm run db:seed` | Create admin user       |
