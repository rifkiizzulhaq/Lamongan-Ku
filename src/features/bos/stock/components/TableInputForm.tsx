"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import {
  LuPlus,
  LuTrash2,
  LuPencil,
  LuSave,
  LuX,
  LuLoader,
} from "react-icons/lu";
import {
  createTable,
  updateTable,
  deleteTable,
} from "@/src/server/bos/table/table.server";
import { useWarungStore } from "@/src/store/warungStore";
import { useUiStore } from "@/src/store/uiStore";

export interface TableItem {
  id: number;
  name: string;
}

interface TableInputFormProps {
  tables: TableItem[];
}

export default function TableInputForm({ tables }: TableInputFormProps) {
  const { isBuka } = useWarungStore();
  const { addToast } = useUiStore();
  const [newTableName, setNewTableName] = useState("");
  const [addingTable, setAddingTable] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [editTableName, setEditTableName] = useState("");

  const queryClient = useQueryClient();

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  };

  const { mutate: addTable, isPending: isAdding } = useMutation({
    mutationFn: (name: string) => createTable(name),
    onSuccess: (res) => {
      if (res.success) {
        setAddingTable(false);
        setNewTableName("");
        invalidateData();
        addToast("Berhasil menambah meja!", "success");
      } else {
        addToast(res.error || "Gagal menambah meja", "error");
      }
    },
  });

  const { mutate: editTable, isPending: isEditing } = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateTable(id, name),
    onSuccess: (res) => {
      if (res.success) {
        setEditingTableId(null);
        invalidateData();
        addToast("Meja berhasil diperbarui!", "success");
      } else {
        addToast(res.error || "Gagal memperbarui meja", "error");
      }
    },
  });

  const { mutate: removeTable, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteTable(id),
    onSuccess: (res) => {
      if (res.success) {
        invalidateData();
        addToast("Meja telah dihapus!", "success");
      } else {
        addToast(res.error || "Gagal menghapus meja", "error");
      }
    },
  });

  const handleAdd = () => {
    if (!newTableName.trim() || !isBuka) return;
    addTable(newTableName);
  };

  const handleEditSave = (id: number) => {
    if (!editTableName.trim() || !isBuka) return;
    editTable({ id, name: editTableName });
  };

  return (
    <div className="flex flex-col shrink-0 p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full relative overflow-hidden mt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-neutral-800 dark:text-white uppercase tracking-tight">
            Meja Pelanggan
          </h2>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            Kelola meja makan yang <br /> tersedia
          </p>
        </div>
        {!addingTable && isBuka && (
          <Button
            onClick={() => setAddingTable(true)}
            className="flex items-center gap-1 text-xs font-bold text-orange border border-orange/40 bg-orange/10 hover:bg-orange/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LuPlus size={18} strokeWidth={3} />
            Tambah
          </Button>
        )}
      </div>

      {addingTable && (
        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 mb-6 flex flex-col gap-3">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Tambah Meja Baru
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="new-table-name"
              type="text"
              placeholder="Contoh: Meja 1"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="w-full sm:flex-1 p-2"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleAdd}
                disabled={isAdding || !newTableName.trim()}
                className="bg-orange hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center flex-1 sm:min-w-25"
              >
                {isAdding ? <LuLoader className="animate-spin" /> : "Simpan"}
              </Button>
              <Button
                onClick={() => {
                  setAddingTable(false);
                  setNewTableName("");
                }}
                disabled={isAdding}
                className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white font-bold px-4 rounded-xl flex items-center justify-center flex-1 sm:w-auto"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tables.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm italic border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
            Belum ada meja.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-orange-500/50 transition-colors shadow-sm"
              >
                {editingTableId === table.id ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Input
                      id={`edit-table-${table.id}`}
                      type="text"
                      value={editTableName}
                      onChange={(e) => setEditTableName(e.target.value)}
                      className="w-full flex-1 h-9 p-2"
                    />
                    <div className="w-full flex gap-2 mt-2">
                      <Button
                        onClick={() => handleEditSave(table.id)}
                        disabled={isEditing || !editTableName.trim()}
                        className="h-9 w-full p-0 flex items-center justify-center bg-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      >
                        <LuSave size={16} />
                      </Button>
                      <Button
                        onClick={() => setEditingTableId(null)}
                        disabled={isEditing}
                        className="h-9 w-full p-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50"
                      >
                        <LuX size={16} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange"></div>
                      {table.name}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          setEditingTableId(table.id);
                          setEditTableName(table.name);
                        }}
                        disabled={!isBuka || isDeleting || isEditing}
                        className="p-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-lg transition-colors"
                      >
                        <LuPencil size={14} />
                      </Button>
                      <Button
                        onClick={() => removeTable(table.id)}
                        disabled={!isBuka || isDeleting || isEditing}
                        className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      >
                        <LuTrash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isBuka && (
        <div className="absolute inset-0 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
          <div className="bg-white dark:bg-neutral-800 px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest">
              Warung Tutup
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
