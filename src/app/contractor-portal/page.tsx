"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileSignature,
  FileText,
  LogOut,
  PenTool,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  mock1099s,
  mockContracts,
  mockContractors,
  mockInvoices,
  type Invoice,
} from "@/data/mockContractors";
import { formatDate } from "@/utils/formatDate";

const contractor = mockContractors[0];
const activeContract = mockContracts.find((contract) => contract.contractorId === contractor.id);
const taxForm = mock1099s.find((form) => form.contractorId === contractor.id && form.status !== "Draft");

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const classes: Record<Invoice["status"], string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    Approved: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
    Rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
    "Revision Requested": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${classes[status]}`}>
      {status}
    </span>
  );
}

function InvoiceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (invoice: Invoice) => void }) {
  const [invoiceNumber, setInvoiceNumber] = useState(`ADS-${new Date().getFullYear()}-043`);
  const [amount, setAmount] = useState("8500");
  const [description, setDescription] = useState("Monthly design retainer");

  const submitInvoice = () => {
    const parsedAmount = Number(amount);
    if (!invoiceNumber || !description || !parsedAmount) return;

    const submittedDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(submittedDate.getDate() + 15);

    onSubmit({
      id: `inv-${Date.now()}`,
      contractorId: contractor.id,
      contractorName: contractor.name,
      invoiceNumber,
      amount: parsedAmount,
      submittedDate: submittedDate.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      status: "Pending",
      description,
      attachmentName: `${invoiceNumber}.pdf`,
    });
    toast.success("Invoice submitted", { description: "The admin team has been notified for approval." });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Submit Invoice</h2>
              <p className="text-xs text-slate-500">Alice Design Studio LLC</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close invoice form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Invoice Number</label>
            <input
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-sm font-bold text-slate-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <UploadCloud className="mx-auto mb-2 text-slate-400" size={22} />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Attach PDF invoice</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitInvoice}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Submit <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorPortalPage() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState(() =>
    mockInvoices.filter((invoice) => invoice.contractorId === contractor.id)
  );

  const totals = useMemo(() => {
    const pending = invoices.filter((invoice) => invoice.status === "Pending").reduce((sum, invoice) => sum + invoice.amount, 0);
    const approved = invoices.filter((invoice) => invoice.status === "Approved").reduce((sum, invoice) => sum + invoice.amount, 0);
    const paid = invoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
    return { pending, approved, paid };
  }, [invoices]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices((current) => [invoice, ...current]);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/contractor-portal" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <span className="text-xs font-black">AD</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">{contractor.businessName}</p>
              <p className="text-xs text-slate-500">{contractor.email}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.success("Contractor profile saved")}
              className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Profile
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900"
            >
              <LogOut size={14} /> Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Contractor Portal</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Welcome back, {contractor.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
          >
            <UploadCloud size={17} /> Submit Invoice
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-black">{money(totals.pending)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Approved</span>
              <CheckCircle2 size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-black">{money(totals.approved)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Paid YTD</span>
              <CreditCard size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-black">{money(contractor.ytdPayments)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Bank</span>
              <ShieldCheck size={16} className="text-slate-400" />
            </div>
            <p className="text-base font-black">{contractor.bankMethod} ****{contractor.bankLast4}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold">Payment Tracker</h2>
                <p className="text-xs text-slate-500">Invoices, approvals, and ACH status</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UploadCloud size={14} /> New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Submitted</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-bold">{invoice.invoiceNumber}</p>
                        <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">{invoice.description}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(invoice.submittedDate)}</td>
                      <td className="px-5 py-4 text-right font-bold">{money(invoice.amount)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <FileSignature size={18} className="text-indigo-500" />
                <h2 className="text-base font-bold">Active Contract</h2>
              </div>
              {activeContract && (
                <div className="space-y-4">
                  <div>
                    <p className="font-bold">{activeContract.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(activeContract.startDate)} to {formatDate(activeContract.endDate)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Rate</p>
                      <p className="mt-1 font-bold">${activeContract.rate.toLocaleString()}{activeContract.rateUnit}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Terms</p>
                      <p className="mt-1 font-bold">{activeContract.paymentTerms}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Contract PDF opened")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    <FileText size={15} /> View Contract
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <h2 className="text-base font-bold">Tax & Documents</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-bold">Signed W-9</p>
                    <p className="text-xs text-slate-500">Stored in documents</p>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-bold">{taxForm?.taxYear ?? 2024} 1099-NEC</p>
                    <p className="text-xs text-slate-500">{money(taxForm?.box1Amount ?? 0)} Box 1</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("1099-NEC download started")}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    aria-label="Download 1099"
                  >
                    <Download size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Bank account update opened")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <CreditCard size={15} /> Update Bank Account
                </button>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <PenTool size={18} className="text-orange-500" />
            <h2 className="text-base font-bold">Onboarding Checklist</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { label: "Portal signup", icon: CheckCircle2, done: true },
              { label: "W-9 signed", icon: FileText, done: true },
              { label: "Bank connected", icon: CreditCard, done: true },
              { label: "Contract active", icon: Calendar, done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <item.icon size={18} className={item.done ? "text-emerald-500" : "text-slate-400"} />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showInvoiceModal && <InvoiceModal onClose={() => setShowInvoiceModal(false)} onSubmit={addInvoice} />}
    </main>
  );
}
