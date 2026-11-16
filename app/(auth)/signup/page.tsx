///app/(auth)/signup/page.tsx
import { AuthFormWrapper } from "@/components/(auth)/auth-form-wrapper";
import { SignupForm } from "@/components/(auth)/signup-form";

export const metadata = {
  title: "Create Account - TheTathyaNews",
  description: "Create your TheTathyaNews account",
};

export default function SignupPage() {
  return (
    <AuthFormWrapper
      title="Create Your Account"
      subtitle="Join TheTathyaNews to access exclusive satirical content"
    >
      <SignupForm />
    </AuthFormWrapper>
  );
}