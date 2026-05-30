import { toast } from "sonner";

type MutationErrorToastOptions = {
  action: string;
  retry?: () => void;
};

export function showMutationErrorToast({
  action,
  retry,
}: MutationErrorToastOptions) {
  let toastId: string | number = "";
  toastId = toast.custom(
    () => (
      <div className="flex max-w-sm items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xl dark:border-red-500/30 dark:bg-slate-900 dark:text-white">
        <div className="min-w-0 flex-1">
          <p className="font-black">Failed to {action}. Please try again.</p>
        </div>
        {retry ? (
          <button
            type="button"
            onClick={() => {
              toast.dismiss(toastId);
              retry();
            }}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        ) : null}
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-right",
    },
  );
}
