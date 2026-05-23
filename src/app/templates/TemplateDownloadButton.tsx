"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Download, X } from "lucide-react";
import type { TemplateResource } from "@/data/templates";

type TemplateDownloadButtonProps = {
  template: TemplateResource;
  className?: string;
  children?: ReactNode;
};

type DownloadResponse = {
  success: boolean;
  downloadUrl?: string;
  message?: string;
  error?: string;
};

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501+"];

function getDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() || "";
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] || ""
  );
}

function writeDomainCookie(domain: string) {
  document.cookie = `cw_template_domain=${encodeURIComponent(
    domain,
  )}; path=/; max-age=31536000; samesite=lax`;
}

export default function TemplateDownloadButton({
  template,
  className = "",
  children,
}: TemplateDownloadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [storedEmail, setStoredEmail] = useState("");
  const [storedDomain, setStoredDomain] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    companySize: "",
  });

  useEffect(() => {
    const email = localStorage.getItem("cw_template_email") || "";
    const domain =
      decodeURIComponent(readCookie("cw_template_domain")) ||
      localStorage.getItem("cw_template_domain") ||
      "";

    setStoredEmail(email);
    setStoredDomain(domain);
  }, []);

  const canSkipGate = useMemo(() => {
    return Boolean(
      storedEmail &&
        storedDomain &&
        getDomain(storedEmail) === storedDomain.toLowerCase(),
    );
  }, [storedDomain, storedEmail]);

  async function requestDownload(payload: {
    firstName?: string;
    email: string;
    companySize?: string;
    returningVisitor?: boolean;
  }) {
    const res = await fetch("/api/templates/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        templateId: template.id,
      }),
    });

    const data = (await res.json()) as DownloadResponse;
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Unable to send the download link.");
    }

    return data;
  }

  async function handleClick() {
    setError("");
    setMessage("");

    if (!canSkipGate) {
      setIsSuccess(false);
      setIsModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setIsModalOpen(true);
    setIsSuccess(false);

    try {
      const data = await requestDownload({
        email: storedEmail,
        returningVisitor: true,
      });
      setMessage(
        data.message ||
          `We recognized ${storedDomain} and sent the download link again.`,
      );
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await requestDownload(formData);
      const domain = getDomain(formData.email);

      localStorage.setItem("cw_template_email", formData.email.toLowerCase());
      localStorage.setItem("cw_template_domain", domain);
      writeDomainCookie(domain);
      setStoredEmail(formData.email.toLowerCase());
      setStoredDomain(domain);
      setMessage(data.message || "Your download link is on its way.");
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className={className}
      >
        {children || (
          <>
            <Download className="h-4 w-4" />
            Download Free
          </>
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close download form"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-black text-[#0A1628]">
                  Check your inbox
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-500">
                  {message ||
                    `We sent the download link for ${template.title} to your work email and added you to the template nurture sequence.`}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
                    <Download className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-2 text-center text-2xl font-black text-[#0A1628]">
                  Get your free template
                </h3>
                <p className="mb-6 text-center text-sm font-medium leading-relaxed text-slate-500">
                  Enter your details and we will email the download link for{" "}
                  <strong>{template.title}</strong>.
                </p>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-slate-700">
                      First name
                    </span>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          firstName: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Jane"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-slate-700">
                      Work email
                    </span>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          email: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="jane@company.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-slate-700">
                      Company size
                    </span>
                    <select
                      required
                      value={formData.companySize}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          companySize: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="" disabled>
                        Select company size...
                      </option>
                      {COMPANY_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} employees
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Download Free"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
