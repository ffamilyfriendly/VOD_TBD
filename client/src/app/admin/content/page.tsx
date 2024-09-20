"use client";
import Button from "@/components/button";
import { Title } from "@/components/common";
import { useState } from "react";
import UploadModal from "./upload";

export default function Content() {
  const [uploadModal, setUploadModal] = useState(true);

  return (
    <main>
      <Button on_click={() => setUploadModal(true)} theme="primary">
        New
      </Button>
      {uploadModal ? <UploadModal /> : null}
      <Title>Filmer</Title>
    </main>
  );
}
