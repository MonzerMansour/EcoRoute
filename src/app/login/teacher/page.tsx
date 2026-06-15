import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Teacher Login",
};

export default function TeacherLoginPage() {
  return (
    <LoginForm
      role="teacher"
      title="Teacher & Staff Sign In"
      subtitle="Access your season planner, emissions dashboard, and travel optimizer."
      accent="brand"
    />
  );
}
