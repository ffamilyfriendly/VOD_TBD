"use client";
import Image from "next/image";
import Client from "@/lib/client";
import Button from "@/components/button";
import { Center, STYLE, styles } from "@/components/common";
import cs from "@/styles/common.module.css";
import Input from "@/components/input";

export default function Home() {
  return (
    <main className="gradient">
      <Center fill_height={true}>
        <div
          className={styles(
            STYLE.THEME.surface,
            STYLE.BORDER_RADIUS.md,
            STYLE.PADDING.lg,
            cs.stack,
            cs.gap_lg
          )}
        >
          <h1>Login</h1>

          <form className={styles(cs.stack, cs.gap_lg)}>
            <Input placeholder="Enter your email" type="email" label="Email" />
            <Input
              placeholder="Enter your password"
              type="password"
              label="Password"
            />
          </form>

          <Button
            wide={true}
            className={STYLE.BORDER_RADIUS.md}
            theme="primary"
          >
            Login
          </Button>
        </div>
      </Center>
    </main>
  );
}
