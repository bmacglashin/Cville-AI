import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Shown on auth/portal/admin surfaces when Supabase env vars are absent. */
export function SetupNotice() {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-20">
      <Alert variant="info">
        <AlertTitle>Supabase isn&apos;t connected yet</AlertTitle>
        <AlertDescription>
          <p className="mt-1">
            This part of the app needs a database. Copy <code>.env.example</code> to{" "}
            <code>.env.local</code>, add your Supabase URL and anon key, and restart the dev
            server. Full steps are in the README.
          </p>
          <p className="mt-3">
            <Link href="/" className="font-medium underline">
              ← Back to the site
            </Link>
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
