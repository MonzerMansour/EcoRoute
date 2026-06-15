import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Student Login",
};

export default function StudentLoginPage() {
  return (
    <LoginForm
      role="student"
      title="Student & Parent Sign In"
      subtitle="Join carpool clusters, map your commute, and coordinate game day rides."
      accent="teal"
    />
  );
}
