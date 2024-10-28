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
import { create_context_enviroment, I_GenericContext } from "@/lib/context";
import { ToastContext } from "@/components/Toast";
import { if_error, untangle_result } from "@/lib/client";

const { Context, Enviroment } = create_context_enviroment<Collection[]>();

function CollectionElement({ data }: { data: Collection }) {
  const [show_context, set_show_context] = useState(false);
  const { item, set_item } = useContext(Context)!;
  const [pos, set_pos] = useState<{ top: number; left: number } | null>();
  const r = useRef<HTMLTableCellElement>(null);
  const client = useContext(ClientContext);
  const toast = useContext(ToastContext);

  const router = useRouter();

  useEffect(() => {
    if (r.current) {
      const position = r.current.getBoundingClientRect();
      set_pos({ top: position.top, left: position.left });
    }
  }, [r, item]);

  function delete_entity() {
    client.content.delete_entity(data.entity.entity_id).then((res) => {
      if (res.ok) {
        set_item((elements) => {
          const rv = elements.filter(
            (el) => el.entity.entity_id != data.entity.entity_id
          );
          return rv;
        });
      } else {
        toast?.from_error(res)
      }
    });
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

export function ContentsTable(props: {
  entity_type: EntityType;
  parent?: string;
}) {
  return (
    <Enviroment initial_value={[]}>
      <_ContentsTable {...props} />
    </Enviroment>
  );
}

export function _ContentsTable(props: {
  entity_type: EntityType;
  parent?: string;
}) {
  const client = useContext(ClientContext);
  const { item, set_item } = useContext(Context)!;
  const toast = useContext(ToastContext);

  useEffect(() => {
    client.content
      .get_collections(props.parent || "root", {
        entity_type: props.entity_type,
      })
      .then((res) => {
        if (res.ok) {
          set_item(res.value);
        } else {
          toast?.from_error(res)
        }
      });
  }, [client.content, props.entity_type, props.parent]);

  return (
    <table className={common.table}>
      <tr>
        <th>id</th>
        <th>title</th>
        <th>options</th>
      </tr>

      {item?.map((s) => (
        <CollectionElement key={s.entity.entity_id} data={s} />
      ))}
    </table>
  );
}

export default function Content() {
  const client = useContext(ClientContext);
  const router = useRouter();
  const toast = useContext(ToastContext);
  const [collections, set_collections] = useState<Collection[]>();

  async function createNewEntity() {
    const result = await client.content.create_entity(EntityType.Movie);

    untangle_result(result, 
      (res) => {  router.push(`/admin/content/${res.entity_id}`) },
      toast?.from_error
    )
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
      <ContentsTable entity_type={EntityType.Movie} />

      <Button on_click={createFromId} theme="primary">
        New
      </Button>
      <Title>Series</Title>
      <ContentsTable entity_type={EntityType.Series} />
    </main>
  );
}
