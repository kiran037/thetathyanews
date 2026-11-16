///app/(auth)/reset-password/page.tsx
import { Suspense } from "react";
import { AuthFormWrapper } from "@/components/(auth)/auth-form-wrapper";
import { ResetPasswordForm } from "@/components/(auth)/reset-password-form";

export const metadata = {
  title: "Reset Password - TheTathyaNews",
  description: "Create a new password for your account",
};

export default function ResetPasswordPage() {
  return (
    <AuthFormWrapper
      title="Reset Your Password"
      subtitle="Enter the code we sent and create a new password"
      showBackToHome={false}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthFormWrapper>
  );
}