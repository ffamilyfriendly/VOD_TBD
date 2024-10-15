"use client";
import Button from "@/components/button";
import { Title } from "@/components/common";
import { useContext, useEffect, useState } from "react";
import common from "@/styles/common.module.css";
import { ClientContext } from "@/components/ClientProvider";
import { Collection, EntityType } from "@/lib/content";
import { useRouter } from "next/navigation";

function CollectionElement({ data }: { data: Collection }) {
  return (
    <tr>
      <td>{data.entity.entity_id}</td>
      <td>{data.metadata.title}</td>
    </tr>
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
          <th>priority</th>
          <th>size</th>
          <th>options</th>
        </tr>

        {collections?.map((s) => (
          <CollectionElement key={s.entity.entity_id} data={s} />
        ))}
      </table>
    </main>
  );
}
