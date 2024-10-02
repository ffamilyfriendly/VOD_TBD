import { ClientContext } from "@/components/ClientProvider";
import ContextMenu from "@/components/ContextMenu";
import { Source as SourceThing } from "@/lib/content";
import { codec_supported } from "@/lib/helpers";
import { useContext, useEffect, useRef, useState } from "react";
import { MdDeleteForever, MdOpenInFull } from "react-icons/md";
import { SourceContext } from "./page";

interface I_Source {
  data: SourceThing;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function Source({ data, ...props }: I_Source) {
  const r = useRef<HTMLTableCellElement>(null);
  const [pos, set_pos] = useState<{ top: number; left: number } | null>();
  const [show_context, set_show_context] = useState(false);
  const client = useContext(ClientContext);

  const { setSources } = useContext(SourceContext)!;

  if (data.audio_codec) {
    console.log("is audio supported? ", codec_supported(data.audio_codec));
  }

  if (data.video_codec) {
    console.log("is video supported? ", codec_supported(data.video_codec));
  }

  async function delete_source() {
    const res = await client.content.delete_source(data.source_id);

    if (res.ok) {
      setSources((s) => {
        return s.filter((src) => src.source_id !== data.source_id);
      });
      // remove source from state
    } else {
      alert("could not delete source");
      console.error(res.error);
      // WE NEED TO ERROR SHIT HERE
    }
  }

  useEffect(() => {
    if (r.current) {
      const position = r.current.getBoundingClientRect();
      set_pos({ top: position.top, left: position.left });
    }
  }, [r]);

  return (
    <>
      <tr>
        <td>{data.source_id}</td>
        <td>{data.content_type}</td>
        <td>{data.priority}</td>
        <td>{formatBytes(data.size)}</td>
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
              on_click() {
                alert("NOT IMPLEMENTED");
              },
            },
            {
              text: "Delete",
              icon: MdDeleteForever,
              on_click: () => {
                delete_source();
              },
            },
          ]}
        />
      )}
    </>
  );
}
