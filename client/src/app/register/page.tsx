"use client";
import { SubmitButton } from "@/components/button";
import { Center, STYLE, styles } from "@/components/common";
import cs from "@/styles/common.module.css";
import Input from "@/components/input";
import { FormEvent, use, useContext, useState } from "react";
import { use_form_data } from "@/lib/helpers";
import { ClientContext } from "@/components/ClientProvider";
import Information from "@/components/Information";
import AuthStyle from "@/styles/auth.module.css";
import { useSearchParams, useRouter } from "next/navigation";

export default function Register() {
  const client = useContext(ClientContext);
  const [error, setError] = useState<Error>();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    const [invite, name, email, password] = use_form_data(e);

    client.register(email, name, password, invite).then((r) => {
      if (r.ok) {
        const redir = searchParams.get("then");
        router.push(redir || "/client/");
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <main className="gradient">
      <Center fill_height={true}>
        <div
          className={styles(
            STYLE.THEME.surface,
            STYLE.BORDER_RADIUS.md,
            STYLE.PADDING.lg,
            cs.stack,
            cs.gap_lg,
            AuthStyle.auth_box
          )}
        >
          <h1>Register</h1>
          {error ? (
            <Information
              title={error.name}
              colour="error"
              text={error.message}
            />
          ) : null}

          <form
            action={"/a"}
            onSubmit={handleLogin}
            className={styles(cs.stack, cs.gap_lg)}
          >
            <div className={AuthStyle.grid}>
              <Input
                width={"full"}
                placeholder="Enter your invite"
                type="text"
                label="Invite"
                initial={searchParams.get("invite") ?? ""}
                min_length={5}
                required={true}
              />
              <Input
                width={"full"}
                placeholder="Enter your name"
                type="text"
                label="Name"
                min_length={5}
                required={true}
              />
            </div>

            <Input
              width={"full"}
              placeholder="Enter your email"
              type="email"
              label="Email"
            />
            <Input
              placeholder="Enter your password"
              type="password"
              label="Password"
              width={"full"}
              min_length={5}
              required={true}
            />

            <SubmitButton
              wide={true}
              className={STYLE.BORDER_RADIUS.md}
              theme="primary"
            >
              Login
            </SubmitButton>
          </form>
        </div>
      </Center>
    </main>
  );
}
