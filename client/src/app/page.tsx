"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Client from "@/lib/client";
import Button from "@/components/button";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="primary">hello</div>

      <Button>Login</Button>
    </main>
  );
}
