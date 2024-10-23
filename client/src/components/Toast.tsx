"use client";
import { createContext, ReactNode, useState } from "react";
import Style from "./Toast.module.css";
import { IconType } from "react-icons";
import { styles } from "./common";

interface I_Toast {
  remove: () => void;
}

interface I_ToastProperties {
  title: string;
  icon?: IconType;
}
interface I_ToastObject extends I_ToastProperties {
  id: string;
}

interface I_ToastContext {
  add_toast: (props: I_ToastProperties) => I_Toast;
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

  return (
    <ToastContext.Provider value={{ add_toast }}>
      <div className={Style.container}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

function Toast({ title }: I_ToastObject) {
  return <div className={styles(Style.toast)}>{title}</div>;
}
