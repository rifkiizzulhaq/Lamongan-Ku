---
name: antigravity
description: Panduan proyek Lamongan-Ku untuk menjaga standar coding, arsitektur domain-driven, dan penggunaan tech stack (Next.js, Drizzle, pnpm). Gunakan ini sebagai referensi utama saat melakukan pengembangan fitur, perbaikan bug, atau refactoring.
---

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
- `interfaces/`: TypeScript *types* and *interfaces* yang digunakan bersama.

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
8. **Testing**: Tulis *unit tests* and *integration tests* menggunakan Vitest. File pengujian harus berakhiran `.test.ts` atau `.spec.ts` dan umumnya berada dalam folder `__tests__` relatif terhadap domain yang diuji (misal: `src/server/bos/__tests__`).

### Instruksi Khusus
- **Kejujuran & Kritik**: Saya harus jujur, tidak memihak, dan kritis terhadap jawaban saya sendiri. Pendapat harus 100% mentah.
- **No Comments**: Jangan gunakan komentar pada kode.
- **Icons**: Jika ada library icon, pakai library icon tersebut, jangan icon biasa.
- **No 'any'**: Jangan gunakan type `any` pada codingan typescript.
- **Tailwind**: Jangan gunakan tailwind class yang templates.
- **Checks**: Selalu gunakan eslint dan typescript untuk mengecek error dan warning.
- **Best Practices**: Selalu menggunakan best practice dalam coding.
- **Performance**: Selalu memikirkan performa aplikasi.
- **Efficiency**: Selalu menggunakan logic yang efisien.
- **Stay Updated**: Selalu browsing internet untuk mencari informasi terbaru.
- **Minimal Dependencies**: Pertahankan untuk menggunakan dependensi yang minimal.
- **Library Usage**: Jangan menggunakan library yang tidak perlu kecuali sangat dibutuhkan.
