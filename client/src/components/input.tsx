import {
  ChangeEvent,
  Dispatch,
  HTMLInputTypeAttribute,
  SetStateAction,
} from "react";
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
  set_state?: Dispatch<SetStateAction<any>>;
  transform_value?: (value: string) => string
}

export default function Input({
  label,
  placeholder = "Text...",
  variant = "filled",
  colour = "surface",
  ...props
}: I_InputOptions) {

  function handle_change(e: ChangeEvent<HTMLInputElement>) {
    if (props.initial && !props.set_state) {
      console.warn(
        "<Input/> component passed 'initial' property but no 'set_state'.\nThis will cause the initial value to be immutable"
      );
    }

    if (props.set_state) {
      const value = props.transform_value ? props.transform_value(e.target.value) : e.target.value
      props.set_state(value);
    }
  }

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
        step={"any"}
        placeholder={placeholder}
        onChange={handle_change}
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
