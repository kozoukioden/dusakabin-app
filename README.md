# DuşakabinPro İmalat Takip Sistemi

Modern, hızlı ve güvenilir Duşakabin Sipariş ve İmalat Yönetim Sistemi.

## Özellikler
- **Akıllı Sipariş Hesaplama**: Ölçü ve model girildiğinde kesim listesini (profil, cam) otomatik çıkarır.
- **Pleksi ve Cam Desteği**: Pleksi modelleri için özel düşüm formülleri (G-9cm) ve profil tanımları.
- **Canlı Stok Takibi**: Üretilen siparişler stoktan otomatik düşülür.
- **İmalat Çizimi**: Usta için otomatik kuşbakışı teknik çizim oluşturur.
- **Kanban Üretim Panosu**: Bekleyen -> İmalatta -> Hazır durum takibi.
- **Mobil Uyumlu**: Tablet ve telefondan rahat kullanım.

## Teknolojiler
- **Framework**: Next.js 15 (App Router)
- **Veritabanı**: Prisma ORM (Local: SQLite / Prod: Postgres)
- **Styling**: Tailwind CSS v4
- **UI**: Lucide React, Framer Motion

## Kurulum (Lokal)

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/kozoukioden/dusakabin-app.git
    cd dusakabin-app
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Veritabanını hazırlayın (Lokalde SQLite için `schema.prisma` dosyasını `sqlite` olarak ayarlamanız gerekebilir. Varsayılan Vercel ayarıdır):
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
4.  Çalıştırın:
    ```bash
    npm run dev
    ```

## Vercel Deployment

Bu proje Vercel üzerinde çalışmak üzere optimize edilmiştir.
1.  Projeyi Vercel'e import edin.
2.  **Storage** bölümünden bir **Vercel Postgres** veritabanı oluşturup bağlayın.
3.  Deploy edin! (Tablolar otomatik oluşur).
