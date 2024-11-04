"use client";
import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import { Collection, EntityType, Source, to_entitytype } from "@/lib/content";
import { useParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import UploadModal from "../upload";
import Button from "@/components/button";
import common from "@/styles/common.module.css";
import { default as SourceElement } from "./source";
import MetaData from "./metadata";
import { createContext } from "react";
import { ContentsTable } from "../page";
import Style from "./page.module.css";
import { Tagging } from "./tagging";
import Actions from "./actions";
import Preview from "./preview";
import { create_context_enviroment } from "@/lib/context";
import { ToastContext } from "@/components/Toast";

interface I_ContextType {
  sources: Source[];
  setSources: Dispatch<SetStateAction<Source[]>>;
}

export const SourceContext = createContext<I_ContextType | null>(null);

export function SourceProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [sources, setSources] = useState<Source[]>([]);

  return (
    <SourceContext.Provider value={{ sources, setSources }}>
      {children}
    </SourceContext.Provider>
  );
}

function Sources(props: { id: string }) {
  const client = useContext(ClientContext);
  const toast = useContext(ToastContext);
  const { sources, setSources } = useContext(SourceContext)!;

  const [showModal, setModal] = useState(false);

  useEffect(() => {
    client.content.get_sources(props.id).then((src) => {
      if (src.ok) {
        setSources(src.value);
      } else {
        toast?.from_error(src)
      }
      console.log(src);
    });
  }, [props.id, client.content, setSources]);

  return (
    <div className={Style.sources_table}>
      {showModal ? <UploadModal parent={props.id} setModal={setModal} /> : null}
      <Title>Sources</Title>
      <Button on_click={() => setModal(true)} theme="primary">
        new source
      </Button>
      <table className={common.table}>
        <tr>
          <th>id</th>
          <th>type</th>
          <th>priority</th>
          <th>size</th>
          <th>options</th>
        </tr>

        {sources.map((s) => (
          <SourceElement key={s.source_id} data={s} />
        ))}
      </table>
    </div>
  );
}

function ChildrenTable(props: { data?: Collection }) {
  if (!props.data) return <p>loading...</p>;

  const entity_type = to_entitytype(
    props.data.entity.entity_type as unknown as string
  );

  const title = entity_type == EntityType.Series ? "Seasons" : "Episodes";
  const show_child_types =
    entity_type == EntityType.Series
      ? EntityType.SeriesSeason
      : EntityType.SeriesEpisode;

  console.log(props.data);

  return (
    <div className={Style.children_table}>
      <Title>{title}</Title>
      <ContentsTable
        entity_type={show_child_types}
        parent={props.data.entity.entity_id}
      />
    </div>
  );
}

const { Enviroment, Context } = create_context_enviroment<Collection>();
export const CollectionContext = Context;

export default function Edit() {
  const xd = useContext(ToastContext);

  const { id } = useParams();
  const [collection, set_collection] = useState<Collection>();
  const client = useContext(ClientContext);

  useEffect(() => {
    if (!(id instanceof Array)) {
      client.content.get_collection(id).then((res) => {
        if (res.ok) {
          set_collection(res.value);
        } else {
          xd?.from_error(res)
        }
      });
    }
  }, [client.content, id]);

  if (id instanceof Array) return "no";

  const entity_type = to_entitytype(
    collection?.entity.entity_type as unknown as string
  );

  if (!collection) return <p>loading...</p>;

  return (
    <main className={Style.main}>
      <Enviroment initial_value={collection}>
        <MetaData data={collection} id={id} />
        <SourceProvider>
          <Sources id={id} />
        </SourceProvider>
        <Tagging entity_id={collection?.entity.entity_id} />
        {entity_type !== EntityType.Movie &&
          entity_type !== EntityType.SeriesEpisode && (
            <ChildrenTable data={collection} />
          )}
        <Actions {...collection} />
        <Preview />
      </Enviroment>
    </main>
  );
}
