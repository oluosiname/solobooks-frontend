"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, Calculator } from "lucide-react";
import Link from "next/link";

export default function AccountDeletedPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
            <Calculator className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {/* Success icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>

          {/* Title */}
          <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
            {t("accountDeleted.title")}
          </h1>

          {/* Description */}
          <p className="mt-4 text-center text-slate-600">
            {t("accountDeleted.description")}
          </p>

          {/* What happens next */}
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left">
            <p className="text-sm font-medium text-slate-700">
              {t("accountDeleted.whatHappensNext")}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>- {t("accountDeleted.next.dataDeleted")}</li>
              <li>- {t("accountDeleted.next.emailConfirmation")}</li>
              <li>- {t("accountDeleted.next.subscriptionCancelled")}</li>
            </ul>
          </div>

          {/* Return home link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t("accountDeleted.returnHome")}
            </Link>
          </div>
        </div>

        {/* Contact support */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {t("accountDeleted.questions")}{" "}
          <a
            href="mailto:support@solobooks.de"
            className="text-indigo-600 hover:text-indigo-500"
          >
            support@solobooks.de
          </a>
        </p>
      </div>
    </div>
  );
}
