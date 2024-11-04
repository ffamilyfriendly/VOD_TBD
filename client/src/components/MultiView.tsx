import { IconType } from "react-icons";
import Style from "./MultiView.module.css";
import React, { useState } from "react";
import { styles } from "./common";

export interface I_MultiGeneric {
  icon?: IconType;
  title: string;
}

export interface I_MultiViewPage extends I_MultiGeneric {
  page: React.ReactNode;
}

interface I_MultiButton extends I_MultiGeneric {
  on_click: () => void;
  selected?: boolean;
}

interface I_MultiButtons {
  buttons: I_MultiButton[];
}

export function MultiButtons({ buttons }: I_MultiButtons) {
  return (
    <div className={Style.multi_buttons}>
      {buttons.map((btn) => (
        <button
          className={styles(Style.button, btn.selected ? Style.selected : "")}
          onClick={btn.on_click}
        >
          {btn.icon && <btn.icon />}
          {btn.title}
        </button>
      ))}
    </div>
  );
}

interface I_MultiView {
  pages: I_MultiViewPage[];
  position: "left" | "center" | "right";
  bottom?: boolean
}

export function MultiView({ pages, ...props }: I_MultiView) {
  const [page, set_page] = useState(0);

  const button_element = <div className={styles(Style.button_container, Style[props.position])}> <MultiButtons
    buttons={pages.map((p, i) => {
      return {
        title: p.title,
        icon: p.icon,
        selected: i == page,
        on_click: () => set_page(i),
      };
    })}
  /> </div>

  return (
    <div className={Style.multiview}>
      {!props.bottom && button_element}      
      <div>{pages[page].page}</div>
      {props.bottom && button_element}      
    </div>
  );
}
