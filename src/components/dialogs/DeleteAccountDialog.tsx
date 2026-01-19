"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: DeleteAccountDialogProps) {
  const t = useTranslations();
  const [confirmationInput, setConfirmationInput] = useState("");
  const confirmationWord = t("settings.privacy.deleteAccount.confirmationWord");

  const isConfirmationValid =
    confirmationInput.toUpperCase() === confirmationWord.toUpperCase();

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;
    await onConfirm();
  };

  const handleClose = () => {
    setConfirmationInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header with warning icon */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("settings.privacy.deleteAccount.dialogTitle")}
            </h3>
          </div>
        </div>

        {/* Warning message */}
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {t("settings.privacy.deleteAccount.warning")}
          </p>
        </div>

        {/* What will be deleted */}
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">
            {t("settings.privacy.deleteAccount.whatWillBeDeleted")}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>
              - {t("settings.privacy.deleteAccount.deletedItems.profile")}
            </li>
            <li>
              - {t("settings.privacy.deleteAccount.deletedItems.invoices")}
            </li>
            <li>
              - {t("settings.privacy.deleteAccount.deletedItems.clients")}
            </li>
            <li>
              -{" "}
              {t("settings.privacy.deleteAccount.deletedItems.transactions")}
            </li>
            <li>
              -{" "}
              {t(
                "settings.privacy.deleteAccount.deletedItems.bankConnections"
              )}
            </li>
          </ul>
        </div>

        {/* Confirmation input */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700">
            {t("settings.privacy.deleteAccount.typeToConfirm", {
              word: confirmationWord,
            })}
          </label>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={confirmationWord}
            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              confirmationInput.length > 0 && !isConfirmationValid
                ? "border-red-300 bg-red-50"
                : "border-slate-300"
            }`}
            disabled={isPending}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isPending}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending
              ? t("settings.privacy.deleteAccount.deleting")
              : t("settings.privacy.deleteAccount.confirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
