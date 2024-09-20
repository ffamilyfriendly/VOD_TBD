import { Modal } from "@/components/common";
import UploadContainer from "./uploadContainer";
import { useContext, useRef, useState } from "react";
import Button from "@/components/button";
import { ClientContext } from "@/components/ClientProvider";

export default function UploadModal() {
  const [file, setFile] = useState<File>();
  const ref = useRef<string>();
  const client = useContext(ClientContext);

  async function createSource() {
    if (!file) return alert("fuck off");
    const res = await client.admin.create_source("root", file?.size || 0);
    console.log(res);

    if (res.ok) {
      console.log(res.value);
      const upload = client.admin.upload_file(res.value.source_id, file);
      console.log(upload);
      console.log("starting upload...");
      upload.start();
    } else {
      console.error(res.error);
    }
  }

  return (
    <Modal title="Upload">
      <UploadContainer setFile={setFile} />
      {file?.name}
      <Button on_click={createSource} theme="secondary">
        hi
      </Button>
    </Modal>
  );
}
