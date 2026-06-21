import { TeacherNav } from "@/teacher/components/TeacherShell";
import { TeacherClientLayout } from "@/teacher/components/TeacherClientLayout";

export const metadata = {
  title: "Coordinator Dashboard",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeacherClientLayout>
      <div className="min-h-[calc(100vh-8rem)] bg-background">
        <TeacherNav />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
      </div>
    </TeacherClientLayout>
  );
}
