///app/(auth)/login/page.tsx
import { Suspense } from "react";
import { AuthFormWrapper } from "@/components/(auth)/auth-form-wrapper";
import { LoginForm } from "@/components/(auth)/login-form";

export const metadata = {
  title: "Sign In - TheTathyaNews",
  description: "Sign in to your TheTathyaNews account",
};

export default function LoginPage() {
  return (
    <AuthFormWrapper
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthFormWrapper>
  );
}