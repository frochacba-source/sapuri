import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Redirect directly to dashboard - no authentication required
    window.location.href = "/dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="animate-pulse text-white text-xl">Redirecionando para o Dashboard...</div>
    </div>
  );
}
