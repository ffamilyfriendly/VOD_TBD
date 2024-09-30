"use client";
import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import { Source } from "@/lib/admin";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import UploadModal from "../upload";
import Button from "@/components/button";
import common from "@/styles/common.module.css";
import { default as SourceElement } from "./source";
import MetaData from "./metadata";

function Sources(props: { id: string }) {
  const client = useContext(ClientContext);
  const [sources, setSources] = useState<Source[]>([]);
  const [showModal, setModal] = useState(false);

  useEffect(() => {
    client.admin.get_sources(props.id).then((src) => {
      if (src.ok) {
        setSources(src.value);
      }
      console.log(src);
    });
  }, [props.id, client.admin]);

  return (
    <div>
      {showModal ? <UploadModal parent={props.id} setModal={setModal} /> : null}
      <Title>Sources</Title>
      <Button on_click={() => setModal(true)} theme="primary">
        new source
      </Button>
      <table className={common.table}>
        <tr>
          <th>id</th>
          <th>type</th>
          <th>priority</th>
          <th>size</th>
          <th>options</th>
        </tr>

        {sources.map((s) => (
          <SourceElement key={s.source_id} data={s} />
        ))}
      </table>
    </div>
  );
}

export default function Edit() {
  const { id } = useParams();

  if (id instanceof Array) return "no";

  return (
    <main>
      {" "}
      cum {id}
      <MetaData id={id} />
      <Sources id={id} />
    </main>
  );
}
