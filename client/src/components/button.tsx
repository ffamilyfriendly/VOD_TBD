import { ReactNode } from "react";
import style from "./button.module.css";
import { I_Common, styles, theme } from "./common";

interface I_Button extends I_Common {
  children: ReactNode | ReactNode[];
  theme: theme;
  on_click?: () => void;
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
      onClick={props.on_click}
    >
      {children}
    </button>
  );
}

interface I_Submit_Button extends I_Common {
  children: string;
  theme: theme;
  wide?: boolean;
}
export function SubmitButton({ children, ...props }: I_Submit_Button) {
  return (
    <input
      type="submit"
      value={children}
      className={styles(
        style.button,
        props.className,
        style[props.theme],
        props.wide ? style.wide : ""
      )}
    ></input>
  );
}
