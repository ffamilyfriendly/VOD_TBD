"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Client from "@/lib/client";
import Button from "@/components/button";
import Movie from "@/components/content/Movie";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="primary">hello</div>
      <Movie
        thumbnail="https://www.themoviedb.org/t/p/w600_and_h900_bestv2/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
        backdrop="https://image.tmdb.org/t/p/original/hO7KbdvGOtDdeg0W4Y5nKEHeDDh.jpg"
        size="large"
      />
    </main>
  );
}
