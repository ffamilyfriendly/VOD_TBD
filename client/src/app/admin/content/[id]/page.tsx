"use client";
import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import { Source } from "@/lib/admin";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import UploadContainer from "../uploadContainer";
import UploadModal from "../upload";
import Button from "@/components/button";

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
      <table>
        <tr>
          <th>id</th>
          <th>size</th>
        </tr>

        {sources.map((s) => (
          <tr key={s.source_id}>
            {" "}
            <td>{s.source_id}</td> <td>{s.size}</td>{" "}
          </tr>
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
      <Sources id={id} />
    </main>
  );
}
