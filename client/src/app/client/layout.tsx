"use client";
import { ClientContext } from "@/components/ClientProvider";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = useContext(ClientContext);
  const pathname = usePathname();
  const router = useRouter();

  const has_permissions = !!client.user || true;

  if (!has_permissions) {
    return router.push(`/login?then=${pathname}`);
  }

  return <>{children}</>;
}
