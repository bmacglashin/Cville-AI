"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { signUpSchema } from "@/lib/validation/intake";
import { signUp } from "@/lib/actions/auth";

type Values = z.infer<typeof signUpSchema>;

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = await signUp(values);
    if (result?.confirmEmail) setConfirmEmail(true);
    else if (result && !result.ok) setServerError(result.error ?? "Sign-up failed.");
  }

  if (confirmEmail) {
    return (
      <Alert variant="success">
        <AlertTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Check your email
        </AlertTitle>
        <AlertDescription>
          <p className="mt-1">
            We sent a confirmation link. Click it to finish creating your workspace.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="full_name">Your name</Label>
        <Input id="full_name" autoComplete="name" className="mt-1.5" {...register("full_name")} />
        {errors.full_name && (
          <p className="mt-1.5 text-xs text-danger">{errors.full_name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="organization_name">Business name</Label>
        <Input
          id="organization_name"
          autoComplete="organization"
          className="mt-1.5"
          {...register("organization_name")}
        />
        {errors.organization_name && (
          <p className="mt-1.5 text-xs text-danger">{errors.organization_name.message}</p>
        )}
      </div>
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
          autoComplete="new-password"
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
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Accounts are for audit clients. Creating one doesn&apos;t start a paid engagement.
      </p>
    </form>
  );
}
