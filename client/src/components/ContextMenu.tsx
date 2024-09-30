import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import Style from "./ContextMenu.module.css";
import { FaAlgolia } from "react-icons/fa";
import { IconType } from "react-icons";

interface I_ContextMenuEntry {
  icon?: IconType;
  text: string;
  on_click: () => void;
}

interface I_ContextMenu {
  pos_left: number;
  pos_top: number;
  state: Dispatch<SetStateAction<boolean>>;
  entries: I_ContextMenuEntry[];
}

export default function ContextMenu({
  pos_left,
  pos_top,
  ...props
}: I_ContextMenu) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;

      element.style.top = `${pos_top}px`;
      element.style.left = `${pos_left}px`;
    }
  }, [ref, pos_left, pos_top]);

  function middleman(cb: () => void) {
    props.state(false);
    cb();
  }

  return (
    <ul ref={ref} className={Style.context_menu}>
      {props.entries.map((entry, i) => (
        <li
          onClick={() => middleman(entry.on_click)}
          className={Style.entry}
          key={i}
        >
          {" "}
          {entry.icon && <entry.icon className={Style.icon} />}
          <p className={Style.text}>{entry.text}</p>{" "}
        </li>
      ))}
    </ul>
  );
}
