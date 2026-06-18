import { CommuteModeLegend } from "@/student/components/StudentShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Commute Modes",
};

export default function StudentCommutePage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Neighborhoods & Commute Modes</h1>
      <p className="mt-2 text-muted-foreground">
        Placeholder: students and parents enter neighborhood and how they usually get to school.
      </p>
      <CommuteModeLegend />
      <Card className="mt-8 max-w-xl">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Neighborhood</Label>
            <Input type="text" placeholder="Oak Street area" disabled />
          </div>
          <div className="space-y-2">
            <Label>Commute mode</Label>
            <Input defaultValue="Solo car" disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            Student team: wire this form to POST /api/student/commute
          </p>
        </CardContent>
      </Card>
    </>
  );
}
