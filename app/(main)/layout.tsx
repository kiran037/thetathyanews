///app/(main)/layout.tsx
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <main className="flex-1 container-custom py-8">
          {children}
        </main>
        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}