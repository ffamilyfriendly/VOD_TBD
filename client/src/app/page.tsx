"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Client from "@/lib/client";

export default function Home() {
  function notif() {
    if (Notification.permission === "granted") {
      const notification = new Notification("Hi there!");
    } else {
      Notification.requestPermission();
    }
  }

  async function doLoginLol() {
    const email = prompt("email") || "";
    const password = prompt("password") || "";
    const c = new Client();
    const r = await c.login(email, password);
    console.log(r);

    if (r.ok) {
      console.log("YAY IT WORKED !!! :D :D", r.value);
      console.log("getting user...");

      const user = await c.getUser();

      if (user.ok) {
        alert(`Hello, ${user.value.name}!`);
        console.log(user);
      } else {
        console.log(user.error);
      }
    } else {
      console.error("NOT WORKED!!!", r.error);
    }
  }

  return (
    <main className={styles.main}>
      <button onClick={doLoginLol}>click if u also love benis!!!!</button>
    </main>
  );
}
