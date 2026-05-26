"use client";

import { useState, useEffect } from "react";
import { useWarungStore } from "@/src/store/warungStore";
import Button from "@/src/components/ui/Button";
import {
  LuPackagePlus,
  LuPlus,
  LuLoader,
  LuTrash2,
  LuTriangleAlert,
  LuPencil,
  LuSave,
} from "react-icons/lu";
import { create, deletes, update } from "@/src/server/bos/stock/stock.server";
import Input from "@/src/components/ui/Input";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useUiStore } from "@/src/store/uiStore";

import { StockFormItem } from "@/interfaces/stock";

interface StockInputFormProps {
  stockList: StockFormItem[];
  isBuka: boolean;
}

export default function StockInputForm({
  stockList,
  isBuka: initialIsBuka,
}: StockInputFormProps) {
  const { addToast } = useUiStore();
  const { setIsBuka } = useWarungStore();

  useEffect(() => {
    setIsBuka(initialIsBuka);
  }, [initialIsBuka, setIsBuka]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [editTarget, setEditTarget] = useState<StockFormItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    nama: string;
  } | null>(null);
  const router = useRouter();

  const { mutate: editItem, isPending: editing } = useMutation({
    mutationFn: ({
      id,
      name,
      price,
    }: {
      id: number;
      name: string;
      price: number;
    }) => update(id, name, price),
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
    mutationFn: ({ name, price }: { name: string; price: number }) =>
      create(name, price),
    onSuccess: (res) => {
      if (res.success) {
        setNewName("");
        setNewPrice("");
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

  const handleTambahItem = () => {
    if (!newName.trim()) return;
    const priceValue = newPrice ? parseInt(newPrice) : 0;
    tambahItem({ name: newName.trim(), price: priceValue });
  };

  const handleEditItem = () => {
    if (!editTarget || !editName.trim()) return;
    const priceValue = editPrice ? parseInt(editPrice) : 0;
    editItem({ id: editTarget.id, name: editName.trim(), price: priceValue });
  };

  const handleOpenEdit = (item: StockFormItem) => {
    setEditTarget(item);
    setEditName(item.nama);
    setEditPrice(item.price.toString());
  };

  return (
    <div className="flex flex-col gap-5 w-full shrink-0">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-neutral-800 dark:text-white">
              Daftar Menu Makanan & Minuman
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Atur nama dan harga menu. Semua menu berstatus selalu tersedia.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-orange border border-orange/40 bg-orange/10 hover:bg-orange/20 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <LuPlus size={14} strokeWidth={3} /> Tambah Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stockList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center col-span-1 md:col-span-2">
              <LuPackagePlus
                size={40}
                className="text-neutral-300 dark:text-neutral-600"
              />
              <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                Belum ada menu.
              </p>
              <p className="text-xs text-neutral-400">
                Tekan tombol{" "}
                <span className="text-orange font-bold">+ Tambah Menu</span>{" "}
                untuk menambahkan item.
              </p>
            </div>
          ) : (
            stockList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3 rounded-xl"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    {item.nama}
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg text-orange hover:bg-orange/10 transition-colors"
                    title="Edit menu"
                  >
                    <LuPencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: item.id, nama: item.nama })
                    }
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Hapus menu"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 z-10 animate-in slide-in-from-bottom-5">
            <h3 className="font-black text-lg text-neutral-800 dark:text-white flex items-center gap-2">
              <LuPackagePlus size={20} /> Tambah Menu Baru
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Nama Menu
                </label>
                <Input
                  id="new-name"
                  placeholder="contoh: Ayam Penyet"
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
              <LuPencil size={20} /> Edit Menu
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Nama Menu
                </label>
                <Input
                  id="edit-name"
                  placeholder="contoh: Ayam Penyet"
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
                  Hapus Menu?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Menu{" "}
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    &quot;{deleteTarget.nama}&quot;
                  </span>{" "}
                  akan dihapus permanen.
                </p>
              </div>
            </div>
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3">
              Tindakan ini tidak dapat dibatalkan.
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
