import Style from "./metadata.module.css";
import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import Input from "@/components/input";
import { resolve } from "node:path/posix";
import {
  FormEvent,
  FormEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";
import Button, { SubmitButton } from "@/components/button";
import { Center, STYLE, styles } from "@/components/common";
import cs from "@/styles/common.module.css";
import { Collection, EntityType } from "@/lib/content";
import { CollectionContext } from "./page";
import { ToastContext } from "@/components/Toast";
import { FaCheck } from "react-icons/fa6";
import TmdbSearchBox from "./tmdb";

interface I_MetaData {
  id: string;
  data?: Collection;
}

export default function MetaData(props: I_MetaData) {
  const client = useContext(ClientContext);
  const toast = useContext(ToastContext);
  const { item, set_item } = useContext(CollectionContext)!;

  const [title, set_title] = useState<string>();
  const [thumbnail, set_thumbnail] = useState<string>();
  const [backdrop, set_backdrop] = useState<string>();
  const [description, set_description] = useState<string>();
  const [ratings, set_ratings] = useState<string>();
  const [language, set_language] = useState<string>();
  const [release_date, set_release_date] = useState<string>();

  const [show_import, set_show_import] = useState(false)

  useEffect(() => {
    if (props.data) {
      const meta = props.data?.metadata;
      set_title(meta.title);
      set_thumbnail(meta.thumbnail);
      set_backdrop(meta.backdrop);
      set_description(meta.description);
      set_ratings(meta.ratings?.toString());
      set_language(meta.language);
      set_release_date(meta.release_date);
    }
  }, [props.data]);

  useEffect(() => {
    set_item((collection) => {
      const new_meta = {
        ...collection.metadata,
        title,
        thumbnail,
        backdrop,
        description,
        ratings: Number(ratings),
        language,
        release_date,
      };
      return { entity: collection.entity, metadata: new_meta };
    });
  }, [
    title,
    thumbnail,
    backdrop,
    description,
    ratings,
    language,
    release_date,
  ]);

  async function handle_submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await client.content.update_metadata(props.id, {
      title,
      thumbnail,
      backdrop,
      description,
      ratings: Number(ratings),
      language,
      release_date,
    });

    if(res.ok) {
      toast?.add_toast({ title: "Updates saved!", theme: "surface", Icon: FaCheck })
    } else {
      toast?.from_error(res)
    }
  }

  return (
    <div className={Style.meta}>
      <Title>Metadata</Title>
      <form
        action={"/a"}
        onSubmit={handle_submit}
        className={styles(cs.stack, cs.gap_lg)}
      >
        <Input
          width={"full"}
          placeholder="Enter title"
          type="text"
          label="Title"
          required={true}
          initial={title}
          set_state={set_title}
        />
        <Input
          width={"full"}
          placeholder="Enter Description"
          type="text"
          label="Description"
          initial={description}
          set_state={set_description}
        />
        <Input
          placeholder="Enter the ratings"
          type="number"
          label="Ratings"
          width={"full"}
          max={10}
          min={0}
          initial={ratings?.toString()}
          set_state={set_ratings}
        />
        <Input
          placeholder="Enter the language"
          type="text"
          label="Language"
          width={"full"}
          initial={language}
          set_state={set_language}
        />
        <Input
          placeholder="Enter the release data"
          type="date"
          label="Release Date"
          width={"full"}
          initial={release_date}
          set_state={set_release_date}
        />
        <Input
          placeholder="Enter the thumbnail URL"
          type="url"
          label="Thumbnail"
          width={"full"}
          initial={thumbnail}
          set_state={set_thumbnail}
        />
        <Input
          placeholder="Enter the backdrop URL"
          type="url"
          label="Backdrop"
          width={"full"}
          initial={backdrop}
          set_state={set_backdrop}
        />

        <SubmitButton
          wide={true}
          className={STYLE.BORDER_RADIUS.md}
          theme="primary"
        >
          Update
        </SubmitButton>
      </form>
      <Button on_click={() => set_show_import(true)} theme="tetriary" wide={true}>
        import from TMDB
      </Button>
      { show_import && <TmdbSearchBox set_state={set_show_import} type={EntityType.Movie} entity_id={props.id} /> }
    </div>
  );
}
