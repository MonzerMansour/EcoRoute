import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Coordinator Login",
};

export default function TeacherLoginPage() {
  return (
    <LoginForm
      role="teacher"
      title="Coordinator & Staff Sign In"
      subtitle="Access your season planner, emissions dashboard, and travel optimizer."
    />
  );
}
