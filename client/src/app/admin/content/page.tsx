"use client";
import Button from "@/components/button";
import { Title } from "@/components/common";
import { useContext, useEffect, useRef, useState } from "react";
import common from "@/styles/common.module.css";
import { ClientContext } from "@/components/ClientProvider";
import { Collection, EntityType } from "@/lib/content";
import { useRouter } from "next/navigation";
import { MdDeleteForever, MdOpenInFull } from "react-icons/md";
import ContextMenu from "@/components/ContextMenu";

function CollectionElement({ data }: { data: Collection }) {
  const [show_context, set_show_context] = useState(false);
  const [pos, set_pos] = useState<{ top: number; left: number } | null>();
  const r = useRef<HTMLTableCellElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (r.current) {
      const position = r.current.getBoundingClientRect();
      set_pos({ top: position.top, left: position.left });
    }
  }, [r]);

  function delete_entity() {
    alert("no");
  }

  function view_entity() {
    router.push(`/admin/content/${data.entity.entity_id}`);
  }

  return (
    <>
      <tr>
        <td>{data.entity.entity_id}</td>
        <td>{data.metadata.title}</td>
        <td onClick={() => set_show_context(true)} ref={r}>
          ...
        </td>
      </tr>
      {pos && show_context && (
        <ContextMenu
          pos_top={pos.top}
          pos_left={pos.left}
          state={set_show_context}
          entries={[
            {
              text: "View",
              icon: MdOpenInFull,
              on_click: view_entity,
            },
            {
              text: "Delete",
              icon: MdDeleteForever,
              on_click: delete_entity,
            },
          ]}
        />
      )}
    </>
  );
}

export default function Content() {
  const client = useContext(ClientContext);
  const router = useRouter();
  const [collections, set_collections] = useState<Collection[]>();

  useEffect(() => {
    client.content.get_collections("root", {}).then((res) => {
      if (res.ok) {
        set_collections(res.value);
      } else {
        console.error(res.error);
      }
    });
  }, [client.content]);

  async function createNewEntity() {
    const res = await client.content.create_entity(EntityType.Movie);

    if (res.ok) {
      router.push(`/admin/content/${res.value.entity_id}`);
    } else {
      alert(res.error);
    }
  }

  async function createFromId() {
    const res = await client.content.create_series_from_id(1396);

    if (res.ok) {
      console.log("OK");
    } else {
      console.error(res.error);
    }
  }

  return (
    <main>
      <Button on_click={createNewEntity} theme="primary">
        New
      </Button>
      <Title>Filmer</Title>
      <table className={common.table}>
        <tr>
          <th>id</th>
          <th>title</th>
          <th>options</th>
        </tr>

        {collections?.map((s) => (
          <CollectionElement key={s.entity.entity_id} data={s} />
        ))}
      </table>

      <Button on_click={createFromId} theme="primary">
        New
      </Button>
      <Title>Series</Title>
    </main>
  );
}
