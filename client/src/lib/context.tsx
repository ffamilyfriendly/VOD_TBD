import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

/*
  
interface I_ContextType {
  sources: Source[];
  setSources: Dispatch<SetStateAction<Source[]>>;
}

export const SourceContext = createContext<I_ContextType | null>(null);


*/

export interface I_GenericContext<T> {
  item: T;
  set_item: Dispatch<SetStateAction<T>>;
}

interface I_GenericProviderProps<T> {
  children: ReactNode | ReactNode[];
  initial_value: T;
}

export function create_context_object<T>() {
  return createContext<I_GenericContext<T> | null>(null);
}

export function create_context_enviroment<T>() {
  const Context = create_context_object<T>();

  function Enviroment({ children, initial_value }: I_GenericProviderProps<T>) {
    const [item, set_item] = useState<T>(initial_value);

    return (
      <Context.Provider value={{ item, set_item }}>{children}</Context.Provider>
    );
  }

  return { Context, Enviroment };
}
