"use client";
import Button, { SubmitButton } from "@/components/button";
import { Center, STYLE, styles } from "@/components/common";
import cs from "@/styles/common.module.css";
import Input from "@/components/input";
import { FormEvent, use, useContext, useState } from "react";
import { use_form_data } from "@/lib/helpers";
import { ClientContext } from "@/components/ClientProvider";
import Information from "@/components/Information";
import AuthStyle from "@/styles/auth.module.css";
import { useSearchParams, useRouter } from "next/navigation";

export default function Login() {
  const client = useContext(ClientContext);
  const [error, setError] = useState<Error>();
  const router = useRouter();
  const searchParams = useSearchParams();

  function redirectOnwards() {
    const redir = searchParams.get("then");
    router.push(redir || "/");
  }

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    const [email, password] = use_form_data(e);

    client.login(email, password).then((r) => {
      if (r.ok) {
        redirectOnwards();
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
          <h1>Login</h1>
          {error ? (
            <Information
              title={error.name}
              colour="error"
              text={error.message}
            />
          ) : null}

          {client.user ? (
            <Information
              title={"ℹ️"}
              colour="bordered"
              text={`Currently logged in as ${client.user.name}`}
            >
              <Button
                className={STYLE.BORDER_RADIUS.md}
                wide={true}
                theme="primary"
                on_click={redirectOnwards}
              >
                Continue as {client.user.name}
              </Button>
            </Information>
          ) : null}

          <form
            action={"/a"}
            onSubmit={handleLogin}
            className={styles(cs.stack, cs.gap_lg)}
          >
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
