"use client";

import { useState, useEffect, useRef } from "react";
import { useWarungStore } from "@/src/store/warungStore";
import Button from "@/src/components/ui/Button";
import {
  LuInfo,
  LuSave,
  LuPackagePlus,
  LuPlus,
  LuLoader,
  LuTrash2,
  LuTriangleAlert,
  LuPencil,
} from "react-icons/lu";
import {
  updateQuantities,
  create,
  deletes,
  update,
} from "@/src/server/bos/stock/stock.server";
import Input from "@/src/components/ui/Input";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useUiStore } from "@/src/store/uiStore";

import { StockFormItem } from "@/interfaces/stock";

interface StockInputFormProps {
  stockList: StockFormItem[];
  isBuka: boolean;
  hasYesterdayData: boolean;
}

export default function StockInputForm({
  stockList,
  isBuka: initialIsBuka,
  hasYesterdayData,
}: StockInputFormProps) {
  const { addToast } = useUiStore();
  const { isBuka, setIsBuka } = useWarungStore();

  useEffect(() => {
    setIsBuka(initialIsBuka);
  }, [initialIsBuka, setIsBuka]);

  const [useSisaKemarin, setUseSisaKemarin] = useState(false);
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    const stocks = () => {
      setStockInputs((prev) => {
        const next: Record<number, string> = {};
        stockList.forEach((item) => {
          next[item.id] =
            prev[item.id] !== undefined
              ? prev[item.id]
              : item.initialQuantity !== null && item.initialQuantity > 0
                ? item.initialQuantity.toString()
                : "";
        });
        return next;
      });
    };
    stocks();
  }, [stockList]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("");

  const [editTarget, setEditTarget] = useState<StockFormItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [isUnlimited, setIsUnlimited] = useState(false);
  const [editIsUnlimited, setEditIsUnlimited] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    nama: string;
  } | null>(null);
  const router = useRouter();

  const { mutate: simpanStok, isPending: saving } = useMutation({
    mutationFn: (items: { stockId: number; quantity: number }[]) =>
      updateQuantities(items),
    onSuccess: (res) => {
      if (res.success) {
        addToast("Stock berhasil disimpan!", "success");
      } else {
        addToast("Gagal menyimpan stock, coba lagi.", "error");
      }
    },
  });

  const { mutate: editItem, isPending: editing } = useMutation({
    mutationFn: ({
      id,
      name,
      price,
      isUnlimited,
    }: {
      id: number;
      name: string;
      price: number;
      isUnlimited: boolean;
    }) => update(id, name, price, isUnlimited),
    onSuccess: (res) => {
      if (res.success) {
        setEditTarget(null);
        router.refresh();
        addToast("Item berhasil diubah!", "success");
      } else {
        addToast("Gagal mengubah item.", "error");
      }
    },
  });

  const { mutate: tambahItem, isPending: addingItem } = useMutation({
    mutationFn: ({
      name,
      price,
      qty,
      isUnlimited,
    }: {
      name: string;
      price: number;
      qty: number;
      isUnlimited: boolean;
    }) => create(name, price, qty, isUnlimited),
    onSuccess: (res) => {
      if (res.success) {
        setNewName("");
        setNewPrice("");
        setNewQty("");
        setIsUnlimited(false);
        setShowAddModal(false);
        router.refresh();
        addToast("Item berhasil ditambah!", "success");
      } else {
        addToast("Gagal menambah item.", "error");
      }
    },
  });

  const { mutate: hapusItem, isPending: deleting } = useMutation({
    mutationFn: (id: number) => deletes(id),
    onSuccess: (res) => {
      if (res.success) {
        setDeleteTarget(null);
        router.refresh();
        addToast("Item berhasil dihapus!", "success");
      } else {
        addToast("Gagal menghapus item.", "error");
      }
    },
  });

  const formatRupiah = (value: string) => {
    if (!value) return "";
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return "";
    return `Rp ${Number(numeric).toLocaleString("id-ID")}`;
  };

  const parseCurrency = (value: string) => value.replace(/\D/g, "");

  const manualInputs = useRef<Record<number, string>>({});

  const handleToggleSisaKemarin = () => {
    if (!isBuka) return;
    const newValue = !useSisaKemarin;
    setUseSisaKemarin(newValue);

    if (newValue) {
      manualInputs.current = { ...stockInputs };
      const newInputs: Record<number, string> = {};
      stockList.forEach((item) => {
        newInputs[item.id] = item.sisaKemarin.toString();
      });
      setStockInputs(newInputs);
    } else {
      setStockInputs({ ...manualInputs.current });
    }
  };

  const handleInputChange = (id: number, value: string) => {
    setStockInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSimpan = () => {
    if (!isBuka || saving) return;

    const items = stockList
      .filter(
        (item) =>
          stockInputs[item.id] !== undefined && stockInputs[item.id] !== "",
      )
      .map((item) => ({
        stockId: item.id,
        quantity: parseInt(stockInputs[item.id]) || 0,
      }));

    if (items.length === 0) {
      addToast("Belum ada stock yang diisi.", "info");
      return;
    }

    simpanStok(items);
  };

  const handleTambahItem = () => {
    if (!newName.trim()) return;
    const priceValue = newPrice ? parseInt(newPrice) : 0;
    const qtyValue = newQty ? parseInt(newQty) : 0;
    tambahItem({ name: newName.trim(), price: priceValue, qty: qtyValue, isUnlimited });
  };

  const handleEditItem = () => {
    if (!editTarget || !editName.trim()) return;
    const priceValue = editPrice ? parseInt(editPrice) : 0;
    editItem({ id: editTarget.id, name: editName.trim(), price: priceValue, isUnlimited: editIsUnlimited });
  };

  const handleOpenEdit = (item: StockFormItem) => {
    setEditTarget(item);
    setEditName(item.nama);
    setEditPrice(item.price.toString());
    setEditIsUnlimited(item.isUnlimited);
  };

  return (
    <div className="flex flex-col gap-5 w-full shrink-0">
      {!isBuka && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex gap-3 items-start">
          <LuInfo className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">Warung Sedang Tutup</p>
            <p className="text-xs mt-1">
              Anda tidak dapat mengubah data stock atau menggunakan sisa
              kemarin. Silakan buka warung terlebih dahulu di halaman Dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-white">
              Gunakan Sisa Kemarin
            </h3>
            <p className="text-xs text-neutral-500">
              {hasYesterdayData
                ? "Otomatis isi stock berdasarkan sisa bahan hari sebelumnya"
                : "Belum ada data sisa kemarin. Tersedia setelah tutup warung pertama."}
            </p>
          </div>
          <Button
            onClick={handleToggleSisaKemarin}
            disabled={!isBuka || !hasYesterdayData}
            title={
              !hasYesterdayData ? "Data sisa kemarin belum tersedia" : undefined
            }
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none shrink-0 border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
              useSisaKemarin && hasYesterdayData
                ? "bg-hijau border-hijau"
                : "bg-neutral-200 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                useSisaKemarin && hasYesterdayData
                  ? "translate-x-6"
                  : "translate-x-0"
              }`}
            />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-neutral-800 dark:text-white">
              Input Stock Hari Ini
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Masukkan jumlah ketersediaan bahan/menu.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-orange border border-orange/40 bg-orange/10 hover:bg-orange/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LuPlus size={14} strokeWidth={3} /> Tambah
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stockList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <LuPackagePlus
                size={40}
                className="text-neutral-300 dark:text-neutral-600"
              />
              <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                Belum ada item stock.
              </p>
              <p className="text-xs text-neutral-400">
                Tekan tombol{" "}
                <span className="text-orange font-bold">+ Tambah</span> untuk
                menambahkan item.
              </p>
            </div>
          ) : (
            stockList.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`stock-${item.id}`}
                    className="text-sm font-bold text-neutral-700 dark:text-neutral-300"
                  >
                    {item.nama}
                    {useSisaKemarin && item.sisaKemarin > 0 && (
                      <span className="ml-2 text-[10px] text-orange bg-orange/10 px-2 py-0.5 rounded-full">
                        Sisa: {item.sisaKemarin}
                      </span>
                    )}
                    <span className="ml-2 text-[10px] text-neutral-400">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </label>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange/10 transition-colors"
                      title="Edit harga item"
                    >
                      <LuPencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ id: item.id, nama: item.nama })
                      }
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Hapus item ini"
                    >
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <Input
                  id={`stock-${item.id}`}
                  type={item.isUnlimited ? "text" : "number"}
                  min="0"
                  disabled={!isBuka || item.isUnlimited}
                  value={item.isUnlimited ? "∞" : (stockInputs[item.id] ?? "")}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  placeholder={item.isUnlimited ? "Unlimited" : "0"}
                  className={`w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange/50 rounded-lg p-3 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${item.isUnlimited ? "text-center font-black text-xl" : ""}`}
                />
              </div>
            ))
          )}
        </div>

        <Button
          disabled={!isBuka || saving || stockList.length === 0}
          onClick={handleSimpan}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-hijau hover:bg-emerald-600 disabled:bg-neutral-300 disabled:dark:bg-neutral-700 disabled:text-neutral-500 text-white font-bold py-3 rounded-xl transition-colors duration-300"
        >
          <LuSave size={18} />
          {saving ? (
            <LuLoader className="animate-spin" size={16} />
          ) : (
            "Simpan Stock"
          )}
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 z-10 animate-in slide-in-from-bottom-5">
            <h3 className="font-black text-lg text-neutral-800 dark:text-white flex items-center gap-2">
              <LuPackagePlus size={20} /> Tambah Item Stock
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Nama Item
                </label>
                <Input
                  id="new-name"
                  placeholder="contoh: Ayam"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Harga (Rp)
                </label>
                <Input
                  id="new-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="contoh: Rp 16.000"
                  value={formatRupiah(newPrice)}
                  onChange={(e) => setNewPrice(parseCurrency(e.target.value))}
                  className="mt-1 w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Stok Awal
                </label>
                <Input
                  id="new-qty"
                  type="number"
                  min="0"
                  placeholder="contoh: 20"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="mt-1 w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange/50"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="new-is-unlimited"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="w-5 h-5 accent-orange rounded cursor-pointer"
                />
                <label htmlFor="new-is-unlimited" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  Stok Bebas / Unlimited
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-sm"
              >
                Batal
              </Button>
              <Button
                onClick={handleTambahItem}
                disabled={addingItem || !newName}
                className="flex-1 py-3 rounded-xl bg-orange text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-50"
              >
                {addingItem ? (
                  <LuLoader className="animate-spin" size={16} />
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 z-10 animate-in slide-in-from-bottom-5">
            <h3 className="font-black text-lg text-neutral-800 dark:text-white flex items-center gap-2">
              <LuPencil size={20} /> Edit Item Stock
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Nama Item
                </label>
                <Input
                  id="edit-name"
                  placeholder="contoh: Ayam"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Harga (Rp)
                </label>
                <Input
                  id="edit-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="contoh: Rp 16.000"
                  value={formatRupiah(editPrice)}
                  onChange={(e) => setEditPrice(parseCurrency(e.target.value))}
                  className="mt-1 w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange/50"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="edit-is-unlimited"
                  checked={editIsUnlimited}
                  onChange={(e) => setEditIsUnlimited(e.target.checked)}
                  className="w-5 h-5 accent-orange rounded cursor-pointer"
                />
                <label htmlFor="edit-is-unlimited" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  Stok Bebas / Unlimited
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                onClick={() => setEditTarget(null)}
                className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-sm"
              >
                Batal
              </Button>
              <Button
                onClick={handleEditItem}
                disabled={editing || !editName}
                className="flex-1 py-3 rounded-xl bg-orange text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {editing ? (
                  <LuLoader className="animate-spin" size={16} />
                ) : (
                  <>
                    <LuSave size={16} /> Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 z-10 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <LuTriangleAlert size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-base text-neutral-800 dark:text-white">
                  Hapus Item Stock?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Item{" "}
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    &quot;{deleteTarget.nama}&quot;
                  </span>{" "}
                  akan dihapus permanen.
                </p>
              </div>
            </div>
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3">
              Tindakan ini tidak dapat dibatalkan. Data historis yang sudah
              tercatat tidak akan terpengaruh.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-sm disabled:opacity-50"
              >
                Batal
              </Button>
              <Button
                onClick={() => hapusItem(deleteTarget.id)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <LuLoader className="animate-spin" size={16} />
                ) : (
                  <>
                    <LuTrash2 size={14} /> Hapus
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
