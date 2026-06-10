"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  auditApplicationSchema,
  type AuditApplication,
  INDUSTRIES,
  TEAM_SIZES,
} from "@/lib/validation/intake";
import { submitAuditApplication } from "./actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-danger">{message}</p>;
}

export function ApplyForm({ calendlyUrl }: { calendlyUrl: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuditApplication>({
    resolver: zodResolver(auditApplicationSchema),
    defaultValues: { industry: INDUSTRIES[0], team_size: TEAM_SIZES[1] },
  });

  async function onSubmit(values: AuditApplication) {
    setServerError(null);
    const result = await submitAuditApplication(values);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setServerError(result.error ?? "Something went wrong.");
    }
  }

  if (submitted) {
    return (
      <Alert variant="success">
        <AlertTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-5 w-5" />
          Application received.
        </AlertTitle>
        <AlertDescription>
          <p className="mt-1">
            Thank you — you&apos;ll hear from Ben within one business day to schedule your free
            20-minute fit call.
          </p>
          {calendlyUrl ? (
            <p className="mt-3">
              Want to skip the back-and-forth?{" "}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Book your fit call now →
              </a>
            </p>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name">Your name *</Label>
          <Input id="full_name" className="mt-1.5" autoComplete="name" {...register("full_name")} />
          <FieldError message={errors.full_name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" className="mt-1.5" autoComplete="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="company">Business name *</Label>
          <Input id="company" className="mt-1.5" autoComplete="organization" {...register("company")} />
          <FieldError message={errors.company?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" className="mt-1.5" autoComplete="tel" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="industry">Industry *</Label>
          <Select id="industry" className="mt-1.5" {...register("industry")}>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
          <FieldError message={errors.industry?.message} />
        </div>
        <div>
          <Label htmlFor="team_size">Team size *</Label>
          <Select id="team_size" className="mt-1.5" {...register("team_size")}>
            {TEAM_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <FieldError message={errors.team_size?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="biggest_bottleneck">
          What eats your week? (the bottleneck that made you click apply) *
        </Label>
        <Textarea
          id="biggest_bottleneck"
          className="mt-1.5"
          rows={3}
          placeholder="e.g., Every proposal waits on me — we're 2–3 weeks behind and losing jobs to faster bids."
          {...register("biggest_bottleneck")}
        />
        <FieldError message={errors.biggest_bottleneck?.message} />
      </div>

      <div>
        <Label htmlFor="message">Anything else? (optional)</Label>
        <Textarea id="message" className="mt-1.5" rows={3} {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>

      {serverError && (
        <Alert variant="danger">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit application"
        )}
      </Button>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        No payment now. Applying gets you a free 20-minute fit call — payment happens only if we
        both decide the audit makes sense. Please don&apos;t include sensitive or regulated
        information in this form.
      </p>
    </form>
  );
}
