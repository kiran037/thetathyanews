///app/(auth)/forgot-password/page.tsx
import { AuthFormWrapper } from "@/components/(auth)/auth-form-wrapper";
import { ForgotPasswordForm } from "@/components/(auth)/forgot-password-form";

export const metadata = {
  title: "Forgot Password - TheTathyaNews",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthFormWrapper
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
    >
      <ForgotPasswordForm />
    </AuthFormWrapper>
  );
}