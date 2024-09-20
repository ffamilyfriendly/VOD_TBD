"use client";
import { ClientContext } from "@/components/ClientProvider";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import Style from "./layout.module.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = useContext(ClientContext);
  const pathname = usePathname();
  const router = useRouter();

  // TODO: remove before prod
  const has_permissions = true || !!client.user;

  if (!has_permissions) {
    return router.push(`/login?then=${pathname}`);
  }

  return (
    <main className={Style.main}>
      <div className={Style.navbar}>
        <Link href={"/admin/content"}>Content</Link>
        <Link href={"/admin/users"}>Users</Link>
        <Link href={"/admin/invites"}>Invites</Link>
      </div>
      <div className={Style.container}>{children}</div>
    </main>
  );
}
