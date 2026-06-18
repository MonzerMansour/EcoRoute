import { CarpoolClusters } from "@/student/components/CarpoolClusters";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Carpool Clusters",
};

export default function StudentCarpoolsPage() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Carpool Clusters</h1>
          <p className="mt-2 text-muted-foreground">
            Nearby families grouped into 2–4 person carpools, with a suggested
            pickup order and estimated daily CO₂ savings.
          </p>
        </div>
        <ButtonLink href="/student/commute" variant="outline" size="sm">
          Edit commuters
        </ButtonLink>
      </div>
      <div className="mt-8">
        <CarpoolClusters />
      </div>
    </>
  );
}
