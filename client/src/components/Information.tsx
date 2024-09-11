import { ReactNode } from "react";
import { I_Common, styles } from "./common";
import style from "./Information.module.css";

interface I_Information extends I_Common {
  text: string;
  title: string;
  children?: ReactNode | ReactNode[];
}

export default function Information({
  className,
  colour,
  text,
  title,
  ...props
}: I_Information) {
  return (
    <div
      className={styles(
        style.information,
        className,
        style[(colour || "primary") as string]
      )}
    >
      <div className={style.top_bar}>
        <b>{title}</b>
        <p>{text}</p>
      </div>
      <div className={style.children}>{props.children}</div>
    </div>
  );
}
