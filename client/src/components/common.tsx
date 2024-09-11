import { ReactNode } from "react";
import style from "./common.module.css";
import cs from "@/styles/common.module.css";

export function styles(...args: (string | undefined)[]): string {
  return args.filter((f) => !!f).join(" ");
}

export interface I_Common {
  className?: string;
  colour?: theme;
}

interface I_Center extends I_Common {
  children: ReactNode | ReactNode[];
  inline?: boolean;
  fill_height?: boolean;
}
export function Center({ children, inline, ...props }: I_Center) {
  return (
    <div
      className={styles(
        style.center,
        !inline ? style.center_not_inline : "",
        props.fill_height ? style.center_fill : "",
        props.className
      )}
    >
      {" "}
      {children}{" "}
    </div>
  );
}

export type theme =
  | "primary"
  | "secondary"
  | "surface"
  | "error"
  | "warning"
  | "bordered";

export const STYLE = {
  THEME: {
    surface: cs.surface,
  },

  BORDER_RADIUS: {
    sm: cs.br_sm,
    md: cs.br_md,
    lg: cs.br_lg,
  },

  PADDING: {
    sm: cs.pad_sm,
    md: cs.pad_md,
    lg: cs.pad_lg,
  },
};
