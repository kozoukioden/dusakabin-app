
# DuşakabinPro Web Uygulaması (v2)

Modern Order, Manufacturing, and Stock tracking system for Shower Cabin Manufacturers.

## Features
- **Order Calculation**: Automatically calculates cutting lists (glass, profiles) based on input dimensions and model. Supports **Pleksi** (Mica) and Glass models with specific deductions.
- **Production Board**: Kanban-style tracking (Pending -> Manufacturing -> Ready).
- **Inventory Management**: Track stock of profiles (pieces/lengths), glass, and accessories. **Stock Deduction** logic included.
- **Local Storage**: Data is persisted in the browser (perfect for demo).
- **Responsive**: Works on Desktop and Mobile.
- **Printable Sheets**: Optimized "İmalat Fişi" for workshop use.

## Setup & Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)
This app is optimized for Vercel.
1.  Push to GitHub.
2.  Import in Vercel.
3.  Deploy.

### Firebase (Optional)
To enable multi-user sync (Admin/Masters/Workers), you need to switch the `lib/db.ts` to use Firestore.
1.  Create Firebase Project.
2.  Install `firebase`: `npm install firebase`
3.  Configure keys in `.env.local`.
