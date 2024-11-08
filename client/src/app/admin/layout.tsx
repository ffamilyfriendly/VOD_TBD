"use client";
import { ClientContext } from "@/components/ClientProvider";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import Style from "./layout.module.css";
import Link from "next/link";
import { Title } from "@/components/common";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = useContext(ClientContext);
  const pathname = usePathname();
  const router = useRouter();
  const has_permissions = true || !!client.user;

  if (!has_permissions) {
    return router.push(`/login?then=${pathname}`);
  }

  return (
    <main className={Style.main}>
      <div className={Style.navbar}>
        <div className={Style.logo}>
          <img className={Style.logo_image} src="/icon-192x192.png" />
          <div>
            <Title>Crime Video</Title>
            <small className={Style.subtitle}>Admin Dashboard</small>
          </div>
        </div>
        <Link href={"/admin/content"}>Content</Link>
        <Link href={"/admin/users"}>Users</Link>
        <Link href={"/admin/invites"}>Invites</Link>
      </div>
      <div className={Style.container}>{children}</div>
    </main>
  );
}
