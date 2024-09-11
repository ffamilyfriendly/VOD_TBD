import { HTMLInputTypeAttribute } from "react";
import { I_Common, styles } from "./common";
import style from "./input.module.css";

interface I_InputOptions extends I_Common {
  label: string;
  type: HTMLInputTypeAttribute;
  variant?: "filled" | "bordered";
  placeholder?: string;
  width?: "full" | null;
  initial?: string;
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  required?: boolean;
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
        style[colour],
        props.width ? style.fill_width : ""
      )}
    >
      <label className={style.label}>{label}</label>
      <input
        placeholder={placeholder}
        className={style.input}
        type={props.type}
        value={props.initial}
        name={label}
        {...{
          min: props.min,
          max: props.max,
          minLength: props.min_length,
          maxLength: props.max_length,
          pattern: props.pattern,
          required: props.required,
        }}
      ></input>
    </div>
  );
}
