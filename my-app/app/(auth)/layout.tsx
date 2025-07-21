// app/(auth)/layout.tsx
import { ThriveStackProvider } from "@/components/ThriveStackProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThriveStackProvider
      apiKey={process.env.NEXT_PUBLIC_THRIVESTACK_API_KEY!}
      source={process.env.NEXT_PUBLIC_THRIVESTACK_SOURCE!}
    >
      {children}
    </ThriveStackProvider>
  );
}
