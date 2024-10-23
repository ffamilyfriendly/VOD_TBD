import { Dispatch, ReactNode, SetStateAction } from "react";
import style from "./common.module.css";
import cs from "@/styles/common.module.css";
import { Bebas_Neue } from "next/font/google";
import Button from "./button";

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

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin-ext"] });
export function Title(props: { children: ReactNode | ReactNode[] }) {
  return <h1 className={bebas.className}>{props.children}</h1>;
}

export function Modal(props: {
  children: ReactNode | ReactNode[];
  title: string;
  dismissable: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className={style.modal_outer}>
      <div className={style.modal}>
        <div className={style.modal_header}>
          <Title>{props.title}</Title>

          {props.dismissable && (
            <Button
              on_click={() => props.setModal(false)}
              className={styles(STYLE.BORDER_RADIUS.md)}
              theme="tetriary"
            >
              Close
            </Button>
          )}
        </div>
        {props.children}
      </div>
    </div>
  );
}

export type theme =
  | "primary"
  | "secondary"
  | "surface"
  | "error"
  | "warning"
  | "bordered"
  | "tetriary";

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
