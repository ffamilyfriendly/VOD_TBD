import { ReactNode } from "react";
import style from "./button.module.css";
import { I_Common, styles, theme } from "./common";

interface I_Button extends I_Common {
  children: ReactNode | ReactNode[];
  theme: theme;
  wide?: boolean;
}
export default function Button({ children, ...props }: I_Button) {
  return (
    <button
      className={styles(
        style.button,
        props.className,
        style[props.theme],
        props.wide ? style.wide : ""
      )}
    >
      {children}
    </button>
  );
}
