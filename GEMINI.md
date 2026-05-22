# Lamongan-Ku - Panduan Proyek

## Gambaran Umum Proyek
Lamongan-Ku adalah aplikasi web Point of Sale (POS) dan manajemen operasional yang dirancang untuk warung makan. Aplikasi ini mendukung fungsionalitas yang berbeda berdasarkan peran (role-based), terutama memisahkan fitur untuk pemilik ("Bos") dan staf ("Karyawan"). Aplikasi ini menggunakan pembaruan *real-time* untuk antrean pesanan dan manajemen meja.

### Teknologi yang Digunakan (Tech Stack)
- **Framework**: Next.js 16 (App Router) dengan React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Autentikasi**: Better Auth
- **State Management (Client)**: Zustand
- **State Management (Server/Async)**: TanStack React Query (v5)
- **Real-time Sync**: Supabase (digunakan utamanya untuk *broadcasting* perubahan database)
- **Testing**: Vitest dan React Testing Library
- **Charts**: ApexCharts

## Struktur Direktori & Arsitektur
Basis kode proyek ini dengan ketat mengikuti pola arsitektur berbasis domain (*domain-driven*):
- `db/`: Berisi skema Drizzle ORM (`schema.ts`, `auth-schema.ts`), pengaturan koneksi database, dan skrip (misal: `reset-data.ts`).
- `src/app/`: Struktur Next.js App Router. Perhatikan route groups `(bos)` dan `(karyawan)` yang berfungsi untuk memisahkan layout dan batas akses.
- `src/features/`: Komponen spesifik per domain (misal: `bos`, `karyawan`, `auth`, `pos`). Ini menjaga kode UI tetap modular dan terikat dengan konteks bisnisnya.
- `src/server/`: *Server Actions* dan logika pengambilan data *backend*. File-file ini berakhiran `.server.ts` dan sesuai dengan domain yang ada di `features`.
- `src/components/ui/`: Komponen UI yang dapat digunakan kembali dan generik (Buttons, Inputs, Skeletons, Modals).
- `src/store/`: *Zustand stores* untuk *global client state* (`uiStore`, `warungStore`, `notificationStore`).
- `src/hooks/`: Kustom React hooks, utamanya `useSupabaseRealtime` untuk reaktivitas *real-time*.
- `interfaces/`: TypeScript *types* dan *interfaces* yang digunakan bersama.

## Cara Build dan Menjalankan
Proyek ini menggunakan `pnpm` sebagai *package manager*.

### Perintah Pengembangan (Development)
```bash
pnpm install       # Menginstal dependensi
pnpm dev           # Menjalankan server development Next.js
pnpm build         # Melakukan build aplikasi untuk production
pnpm start         # Menjalankan server production
pnpm lint          # Menjalankan ESLint
pnpm test          # Menjalankan *test suites* dengan Vitest
```

### Perintah Database (Drizzle)
```bash
pnpm db:generate   # Membuat file migrasi database
pnpm db:push       # Mendorong perubahan skema langsung ke database
pnpm db:studio     # Menjalankan Drizzle Studio untuk inspeksi database
```

## Konvensi & Panduan Pengembangan
1. **Package Manager**: SELALU gunakan `pnpm` untuk menginstal paket dan menjalankan skrip.
2. **Server Actions**: Simpan interaksi database dan logika *server-side* di dalam direktori `src/server/`. Gunakan direktif `"use server"` di bagian atas file-file ini. Jangan pernah menulis *query* database secara langsung di dalam *client components*.
3. **Data Fetching**: Gunakan `@tanstack/react-query` di dalam *client components* untuk memanggil *Server Actions*. Proyek ini sangat bergantung pada `useQuery` dan `useMutation` yang digabungkan dengan `queryClient.invalidateQueries()` untuk reaktivitas.
4. **Pembaruan Real-time**: Saat memutasi data (misal: pesanan, stok), pastikan Anda melakukan *invalidate* pada kunci React Query yang relevan dan manfaatkan *channel* Supabase yang sudah ada (`useSupabaseRealtime`) sehingga semua *client* yang terhubung mendapatkan pembaruan.
5. **Role-Based Access Control (RBAC)**: Terapkan keamanan di tingkat *Server Action* menggunakan utilitas `requireAuth(["role"])` dari `@/lib/auth-guard`.
6. **UI & Styling**: Gunakan Tailwind CSS untuk *styling*. Untuk komponen generik yang baru, letakkan di `src/components/ui`.
7. **Type Safety**: Hindari penggunaan `any`. Bergantunglah pada skema yang didefinisikan di `db/schema.ts` atau tipe data di `interfaces/` untuk memastikan keamanan tipe (*strong typing*). Gunakan `InferSelectModel` dan `InferInsertModel` dari Drizzle.
8. **Testing**: Tulis *unit tests* dan *integration tests* menggunakan Vitest. File pengujian harus berakhiran `.test.ts` atau `.spec.ts` dan umumnya berada dalam folder `__tests__` relatif terhadap domain yang diuji (misal: `src/server/bos/__tests__`).

### Instruksi Untuk Gemini
Saya ingin kamu Jujur tidak terlalu memihak saya dengan artian tidak usah membenarkan yang saya katakan jika yang saya bilang itu salah, bukan berarti jawaban yang kamu lemparkan ke saya benar semua, kamu juga harus kritis dengan jawaban kamu sendiri, pokoknya pendapatnya harus 100% mentah.

### proyek pribadi tambahan
- jangan gunakan komentar pada kode
- jika ada library icon, pakai library icon tersebut, jangan icon biasa
- jangan gunakan type any pada codingan typescript
- jangan tailwind class yang templates
- selalu gunakan eslint dan typescript untuk mengecek error dan warning
- selalu menggunakan best practice dalam coding
- selalu memikirkan performa aplikasi
- selalu menggunakan logic yang efisien
- selalu untuk browsing internet untuk mencari informasi terbaru
- pertahankan untuk memnggunakan depedensi yang minimal
- jangan menggunakan library yang tidak perlu kecuali sangat dibutuhkan
- jika sudah mulai hilang konteks, pindai file ini lagi. 