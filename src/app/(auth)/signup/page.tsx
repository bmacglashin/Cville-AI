import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your client workspace",
  robots: { index: false },
};

export default function SignupPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Create your client workspace</CardTitle>
        <CardDescription>
          For businesses starting an AI Operating Audit. Just exploring?{" "}
          <Link href="/apply" className="font-medium text-bronze-700 underline">
            Start with the application
          </Link>{" "}
          instead — no account needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-bronze-700 underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
