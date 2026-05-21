import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "oklch(0.22 0.014 260)",
          color: "oklch(0.96 0.005 250)",
          border: "1px solid oklch(1 0 0 / 10%)",
          borderRadius: "10px",
          fontSize: "13px",
        },
        success: { iconTheme: { primary: "oklch(0.70 0.17 155)", secondary: "oklch(0.16 0.012 260)" } },
        error: { iconTheme: { primary: "oklch(0.62 0.22 25)", secondary: "oklch(0.98 0 0)" } },
      }}
    />
  );
}
