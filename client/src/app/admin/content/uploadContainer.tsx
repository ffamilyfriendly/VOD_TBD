import style from "./uploadContainer.module.css";
import { FaFileUpload } from "react-icons/fa";
import { Dispatch, DragEvent, SetStateAction } from "react";

export default function UploadContainer({
  setFile,
}: {
  setFile: Dispatch<SetStateAction<File | undefined>>;
}) {
  function openFileDialog() {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
  }

  function handleFile(f: File) {
    setFile(f);
  }

  function dragEntered(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function dragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function dragDropped(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    alert("HI");

    const f = e.dataTransfer.items[0]?.getAsFile();

    if (f !== null) {
      handleFile(f);
    } else {
      alert("FUCKY WUCKY");
    }
  }

  return (
    <div>
      <div
        onClick={() => openFileDialog()}
        onDragEnter={dragEntered}
        onDrop={dragDropped}
        onDragOver={dragOver}
        className={style.container}
      >
        <FaFileUpload />
        Drag or click to upload file
      </div>
    </div>
  );
}
