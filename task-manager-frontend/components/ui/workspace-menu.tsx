"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface WorkspaceMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const WorkspaceMenu = ({ onEdit, onDelete }: WorkspaceMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />

          <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border py-1 z-20">
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setOpen(false);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setOpen(false);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
};
