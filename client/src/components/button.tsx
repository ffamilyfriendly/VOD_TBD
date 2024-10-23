import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import style from "./button.module.css";
import { I_Common, Modal, styles, theme } from "./common";
import Common from "@/styles/common.module.css";
import { useRouter } from "next/navigation";
import { Fa42Group } from "react-icons/fa6";
import { IconType } from "react-icons";

function ConfirmationModal(props: {
  on_click?: () => void;
  set_modal: Dispatch<SetStateAction<boolean>>;
}) {
  function middleware() {
    props.on_click?.();
    props.set_modal(false);
  }
  return (
    <Modal dismissable={false} setModal={props.set_modal} title="Are you sure?">
      <div className={styles(Common.flex, Common.justify_right, Common.gap_lg)}>
        <Button theme="bordered" on_click={() => props.set_modal(false)}>
          cancel
        </Button>
        <Button theme="primary" on_click={middleware}>
          proceed
        </Button>
      </div>
    </Modal>
  );
}

interface I_Button extends I_Common {
  children: ReactNode | ReactNode[];
  theme: theme;
  on_click?: () => void;
  wide?: boolean;
  href?: string;
  confirm?: boolean;
  icon?: IconType;
}
export default function Button({ children, ...props }: I_Button) {
  const router = useRouter();
  function middleware() {
    if (props.href) {
      router.push(props.href);
    } else if (props.on_click) {
      if (props.confirm) {
        set_confirm_modal(true);
      } else {
        props.on_click();
      }
    }
  }

  const [confirm_modal, set_confirm_modal] = useState(false);

  return (
    <>
      <button
        className={styles(
          style.button,
          props.className,
          style[props.theme],
          props.wide ? style.wide : ""
        )}
        onClick={middleware}
      >
        {props.icon && <props.icon />}
        {children}
      </button>
      {confirm_modal && (
        <ConfirmationModal
          set_modal={set_confirm_modal}
          on_click={props.on_click}
        />
      )}
    </>
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
