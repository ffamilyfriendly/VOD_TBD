/* eslint-disable @next/next/no-img-element */
import { Modal, STYLE, styles } from "@/components/common";
import UploadContainer from "./uploadContainer";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "@/components/button";
import { ClientContext } from "@/components/ClientProvider";
import { Err, Ok, Result } from "@/lib/client";
import Style from "./upload.module.css";
import ProgressBar from "@/components/ProgressBar";
import { ms_to_time } from "@/lib/helpers";
import { SourceContext } from "./[id]/page";

interface I_PreviewData {
  thumbnail: Blob;
  width: number;
  height: number;
}

function get_preview(f: File): Promise<Result<I_PreviewData>> {
  const canvas = document.createElement("canvas");
  const video = document.createElement("video");
  video.src = URL.createObjectURL(f);

  return new Promise((resolve) => {
    video.onloadedmetadata = (meta_event) => {
      console.log("LOADED");

      setTimeout(() => {
        video.currentTime = 3000;
      }, 200);

      video.onseeked = (seeked_event) => {
        console.log("SEEKED");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const data = ctx.canvas.toBlob(
            (blob) =>
              blob
                ? resolve(
                    Ok({
                      thumbnail: blob,
                      width: video.videoWidth,
                      height: video.videoHeight,
                    })
                  )
                : resolve(Err(Error("blob could not be generated"))),
            "image/jpeg",
            0.75
          );
        }
      };
    };
  });
}

function Preview({ file }: { file: File }) {
  const [img, setImage] = useState<I_PreviewData>();

  useEffect(() => {
    console.log("running");
    get_preview(file).then((d) => {
      if (d.ok) {
        console.log("setimag");
        setImage(d.value);
      } else {
        console.error("could not get image preview", d.error);
      }
    });
  }, [file]);

  return (
    <div className={Style.preview}>
      <img
        alt="hello"
        src={img ? URL.createObjectURL(img.thumbnail) : "no"}
      ></img>

      <div className={Style.preview_data}>
        <p>{file.name}</p>
        <ul>
          <li>{(file.size / 1024 / 1024 / 1024).toFixed(2)}gb</li>
        </ul>
      </div>
    </div>
  );
}

interface I_UploadModal {
  setModal: Dispatch<SetStateAction<boolean>>;
  parent: string;
}

export default function UploadModal(props: I_UploadModal) {
  const [file, setFile] = useState<File>();
  const [progress, set_progress] = useState<{
    progress: number;
    eta: number;
  } | null>(null);
  const animation_frame_id = useRef<number | null>(null);
  const { setSources } = useContext(SourceContext)!;

  const client = useContext(ClientContext);

  async function createSource() {
    if (!file) return alert("fuck off");
    const res = await client.content.create_source(
      props.parent,
      file?.size || 0,
      file.name.split(".").pop() || "mp4"
    );
    console.log(res);

    if (res.ok) {
      console.log(res.value);
      const upload = client.content.upload_file(res.value.source_id, file);
      console.log(upload);
      console.log("starting upload...");
      upload.callback = (percent_done, _avg_chunk, eta_ms) => {
        animation_frame_id.current = requestAnimationFrame(() => {
          set_progress({ progress: percent_done, eta: eta_ms });
        });

        if (upload.done) {
          client.content.get_source(upload.id).then((res) => {
            if (res.ok) {
              setSources((s) => {
                s.push(res.value);
                return s;
              });
              props.setModal(false);
            } else {
              // ERROR
            }
          });
        }
      };

      upload.start();
    } else {
      console.error(res.error);
    }
  }

  return (
    <Modal dismissable={true} setModal={props.setModal} title="Upload">
      {!file ? <UploadContainer setFile={setFile} /> : <Preview file={file} />}
      {file?.name}
      {progress && (
        <>
          <ProgressBar
            inner_text={`${progress.progress.toFixed(2)}%`}
            value={progress.progress}
          />
          <p>
            <b>ETA:</b> {ms_to_time(progress.eta)}
          </p>
        </>
      )}
      <Button
        on_click={createSource}
        theme="primary"
        className={styles(STYLE.BORDER_RADIUS.md)}
      >
        Start
      </Button>
    </Modal>
  );
}
