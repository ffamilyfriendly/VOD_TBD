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
import ProgressBar from "@/components/ProgressBar";
import { createContext } from "react";
import { ContentsTable } from "../page";

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
  const { sources, setSources } = useContext(SourceContext)!;

  const [showModal, setModal] = useState(false);

  useEffect(() => {
    client.content.get_sources(props.id).then((src) => {
      if (src.ok) {
        setSources(src.value);
      }
      console.log(src);
    });
  }, [props.id, client.content, setSources]);

  return (
    <div>
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
    <div>
      <Title>{title}</Title>
      <ContentsTable
        entity_type={show_child_types}
        parent={props.data.entity.entity_id}
      />
    </div>
  );
}

export default function Edit() {
  const { id } = useParams();
  const [collection, set_collection] = useState<Collection>();
  const client = useContext(ClientContext);

  useEffect(() => {
    if (!(id instanceof Array)) {
      client.content.get_collection(id).then((res) => {
        if (res.ok) {
          set_collection(res.value);
        }
      });
    }
  }, [client.content, id]);

  if (id instanceof Array) return "no";

  const entity_type = to_entitytype(
    collection?.entity.entity_type as unknown as string
  );

  return (
    <main>
      {" "}
      cum {id}
      <MetaData data={collection} id={id} />
      <SourceProvider>
        <Sources id={id} />
      </SourceProvider>
      {entity_type !== EntityType.Movie &&
        entity_type !== EntityType.SeriesEpisode && (
          <ChildrenTable data={collection} />
        )}
    </main>
  );
}
