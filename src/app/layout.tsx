import { ToastProviderComponent } from "@/components/toast-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProviderComponent />
      </body>
    </html>
  );
}
