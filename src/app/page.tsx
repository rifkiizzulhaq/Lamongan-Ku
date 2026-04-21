import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

export default function Page() {
  return (
    <section className="w-full min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <main className="w-80 h-80 flex flex-col justify-between dark:bg-[#171717] border border-neutral-700 rounded-xl py-4 px-5">
        <h1 className="dark:text-white text-center">
          Selamat Datang di Lamongan-Ku
        </h1>

        <div className="h-48 flex flex-col justify-between">
          <div>
            <label htmlFor="input" className="dark:text-white block mb-2">
              Username
            </label>
            <Input
              placeholder="Masukan username"
              id="input"
              className="w-full text-sm dark:bg-neutral-800 dark:border-2 dark:border-neutral-700 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-1 dark:focus:ring-white py-2 px-2 dark:text-white"
            />
            <span>
              <p className="text-red-500 text-xs mt-1">
                Username tidak boleh kosong
              </p>
            </span>
          </div>
          <div>
            <label htmlFor="password" className="dark:text-white block mb-2">
              Password
            </label>
            <Input
              placeholder="Masukan password"
              id="password"
              type="password"
              className="w-full text-sm dark:bg-neutral-800 dark:border-2 dark:border-neutral-700 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-1 dark:focus:ring-white py-2 px-2 dark:text-white"
            />
            <span>
              <p className="text-red-500 text-xs mt-1">
                Password tidak boleh kosong
              </p>
            </span>
          </div>
        </div>
        <div>
          <Button className="w-full bg-neutral-200 text-black text-sm py-2 rounded-lg hover:bg-neutral-300 focus:outline-none focus:ring-1 focus:ring-white">
            Login
          </Button>
        </div>
      </main>
    </section>
  );
}
