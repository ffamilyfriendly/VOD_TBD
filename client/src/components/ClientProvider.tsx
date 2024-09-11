"use client";

import Client from "@/lib/client";
import { createContext } from "react";

const client = new Client();

export const ClientContext = createContext(client);

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}
