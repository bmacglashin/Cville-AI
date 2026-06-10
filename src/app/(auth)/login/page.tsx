import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Client login",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const params = await searchParams;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Client login</CardTitle>
        <CardDescription>
          For audit clients and the Agent Ally team. Not a client yet?{" "}
          <Link href="/apply" className="font-medium text-bronze-700 underline">
            Apply for the audit
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {params.error === "auth" && (
          <Alert variant="danger" className="mb-4">
            <AlertDescription>
              That sign-in link didn&apos;t work or expired. Try again below.
            </AlertDescription>
          </Alert>
        )}
        <LoginForm next={params.next} />
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New client setting up your workspace?{" "}
          <Link href="/signup" className="font-medium text-bronze-700 underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
