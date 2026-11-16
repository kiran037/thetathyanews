///app/(auth)/verify-email/page.tsx
import { Suspense } from "react";
import { AuthFormWrapper } from "@/components/(auth)/auth-form-wrapper";
import { VerifyEmailForm } from "@/components/(auth)/verify-email-form";

export const metadata = {
  title: "Verify Email - TheTathyaNews",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <AuthFormWrapper
      title="Verify Your Email"
      subtitle="We've sent a verification code to your email"
      showBackToHome={false}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthFormWrapper>
  );
}