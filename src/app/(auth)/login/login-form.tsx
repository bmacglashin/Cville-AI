"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInSchema } from "@/lib/validation/intake";
import { signIn } from "@/lib/actions/auth";

type Values = z.infer<typeof signInSchema>;

export function LoginForm({ next }: { next?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = await signIn({ ...values, next });
    // signIn redirects on success; reaching here means failure.
    if (result && !result.ok) setServerError(result.error ?? "Sign-in failed.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1.5"
          {...register("password")}
        />
        {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
      </div>
      {serverError && (
        <Alert variant="danger">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}
