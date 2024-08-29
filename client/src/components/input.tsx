import { HTMLInputTypeAttribute } from "react";
import { I_Common, styles } from "./common";
import style from "./input.module.css";

interface I_InputOptions extends I_Common {
  label: string;
  type: HTMLInputTypeAttribute;
  variant?: "filled" | "bordered";
  placeholder?: string;
}

export default function Input({
  label,
  placeholder = "Text...",
  variant = "filled",
  colour = "surface",
  ...props
}: I_InputOptions) {
  return (
    <div
      className={styles(
        style.container,
        props.className,
        style[variant],
        style[colour]
      )}
    >
      <label className={style.label}>{label}</label>
      <input
        placeholder={placeholder}
        className={style.input}
        type={props.type}
        name={label}
      ></input>
    </div>
  );
}
