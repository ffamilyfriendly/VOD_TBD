"use client";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import Style from "./Toast.module.css";
import { IconType } from "react-icons";
import { styles } from "./common";
import { Result } from "@/lib/client";

interface I_Toast {
  remove: () => void;
}

interface I_ToastProperties {
  title: string;
  Icon?: IconType;
  duration?: number
  require_dismiss?: boolean
  children?: ReactNode | ReactNode[]
  theme: "surface" | "information" | "warning" | "error"
}
interface I_ToastObject extends I_ToastProperties {
  id: string;
  duration: number;
  set_state: Dispatch<SetStateAction<I_ToastObject[]>>
}

interface I_ToastContext {
  add_toast: (props: I_ToastProperties) => I_Toast;
  from_error: (err: Result<never>) => I_Toast
}

export const ToastContext = createContext<I_ToastContext | null>(null);

export default function ToastContainer({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [toasts, set_toasts] = useState<I_ToastObject[]>([]);

  function add_toast(props: I_ToastProperties): I_Toast {
    const toast: I_ToastObject = {
      id: Date.now().toString(),
      duration: props.duration ?? 2000,
      set_state: set_toasts,
      ...props,
    };

    set_toasts([...toasts, toast]);

    return {
      remove() {
        set_toasts((toast_list) => {
          const toast_list_fixed = toast_list.filter((t) => t.id != toast.id);
          return toast_list_fixed;
        });
      },
    };
  }

  function from_error(err: Result<unknown>) {
    if(err.ok) {
      return add_toast({ title: "a good result was passed to from_error", theme: "warning" })
    } else {
      return add_toast({ title: err.error.name, children: err.error.message, theme: "error" })
    }
  }

  return (
    <ToastContext.Provider value={{ add_toast, from_error }}>
      <div className={Style.container}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

function Toast({ title, Icon, theme, ...props }: I_ToastObject) {

  const [is_removing, set_is_removing] = useState(false)

  function remove_self() {
    set_is_removing(true)
    setTimeout(() => {
      props.set_state((toast_list) => {
        const toast_list_fixed = toast_list.filter((t) => t.id != props.id);
        return toast_list_fixed;
      });
    }, 650)
  }

  useEffect(() => {
    if(!props.require_dismiss) {
      const timeout = setTimeout(remove_self, props.duration)
  
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [])

  return <div className={styles(Style.toast, Style[theme], is_removing ? Style.animate_out : "")}>
      <div className={Style.toast_header}>
        <div className={Style.toast_title}>
          {Icon && <Icon />}
          {title}
        </div>
        <button className={Style.toast_dismiss} onClick={remove_self}>x</button>
      </div>
      <div className={Style.children}>
        {props.children}
      </div>
    </div>;
}
