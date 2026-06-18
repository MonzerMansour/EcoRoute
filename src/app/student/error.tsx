"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EcoRoute] student error:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <h2 className="text-xl font-bold">Couldn&apos;t load this page</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong loading your carpool data. Please try again.
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
