"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Trash2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { SearchInput } from "@/components/ui";
import { api } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { showToast } from "@/lib/toast";
import type { Client } from "@/types";

export default function ClientsPage() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Reset dropdown state after hydration to prevent SSR/client mismatches
  React.useEffect(() => {
    setIsHydrated(true);
    setDropdownOpen(null); // Ensure clean state after hydration
  }, []);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: api.getClients,
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => api.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      showToast.success(t("clients.delete.success"));
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: () => {
      showToast.error(t("clients.delete.error"));
    },
  });

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleMenuClick = (clientId: string) => {
    setDropdownOpen(dropdownOpen === clientId ? null : clientId);
  };

  const handleViewInvoices = (clientId: string) => {
    router.push(`/invoices?client_id=${clientId}`);
    setDropdownOpen(null);
  };

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell title={t("clients.title")}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <SearchInput
            placeholder={t("clients.searchPlaceholder")}
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-md"
          />
          <Link href="/clients/new" className={buttonStyles("primary")}>
            <Plus className="h-4 w-4" />
            {t("clients.addClient")}
          </Link>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t("clients.loadingClients")}</p>
          </div>
        ) : filteredClients?.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t("clients.noClients")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients?.map((client, index) => (
              <div
                key={client.id}
                className={cn(
                  styles.card,
                  "p-6 transition-all hover:shadow-md animate-slide-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {client.name}
                    </h3>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{client.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{client.fullAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeleteClick(client)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => handleMenuClick(client.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {isHydrated && dropdownOpen === client.id && (
                        <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                          <button
                            onClick={() => handleViewInvoices(client.id)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            View Invoices
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">
                      {t("clients.totalInvoiced")}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(client.totalInvoiced)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">
                      {t("clients.outstanding")}
                    </p>
                    <p
                      className={`font-semibold ${
                        client.outstanding > 0
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(client.outstanding)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {t("clients.invoiceCount", { count: client.invoiceCount })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && clientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {t("clients.delete.title")}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {t("clients.delete.confirm", { name: clientToDelete.name })}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  disabled={deleteClientMutation.isPending}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteClientMutation.isPending}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteClientMutation.isPending
                    ? t("clients.delete.deleting")
                    : t("clients.delete.title")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
