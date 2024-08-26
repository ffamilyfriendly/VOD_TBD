"use client";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  function notif() {
    if (Notification.permission === "granted") {
      const notification = new Notification("Hi there!");
    } else {
      Notification.requestPermission();
    }
  }

  return (
    <main className={styles.main}>
      <button onClick={notif}>click if u also love benis!!!!</button>
    </main>
  );
}
