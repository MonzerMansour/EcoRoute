"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EcoRoute] teacher error:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <h2 className="text-xl font-bold">Couldn&apos;t load your dashboard</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t reach your trip data. If you just connected a database,
          double-check your <code className="rounded bg-muted px-1">SUPABASE_URL</code>{" "}
          and service-role key, then try again.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>Retry</Button>
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
