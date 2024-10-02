import Style from "./metadata.module.css";
import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import { useContext } from "react";

interface I_MetaData {
  id: string;
}

export default function MetaData(props: I_MetaData) {
  const client = useContext(ClientContext);
  return (
    <div>
      <Title>Metadata</Title>
    </div>
  );
}
