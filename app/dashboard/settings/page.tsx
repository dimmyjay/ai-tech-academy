// app/dashboard/settings/page.tsx
"use client"; // ✅ REQUIRED: next/dynamic with ssr: false must be in a Client Component

import dynamic from "next/dynamic";
import Loader from "@/components/Loader";

// ✅ Dynamically import the settings UI with SSR disabled
const SettingsClient = dynamic(() => import("@/components/SettingsClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size={48} message="Loading settings..." />
    </div>
  ),
});

export default function SettingsPage() {
  return <SettingsClient />;
}
