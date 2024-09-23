"use client";
import Button from "@/components/button";
import { Title } from "@/components/common";
import { useContext, useState } from "react";
import UploadModal from "./upload";
import { ClientContext } from "@/components/ClientProvider";
import { EntityType } from "@/lib/admin";
import { useRouter } from "next/navigation";

export default function Content() {
  const client = useContext(ClientContext);
  const router = useRouter();

  async function createNewEntity() {
    const res = await client.admin.create_entity(EntityType.Movie);

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
    </main>
  );
}
