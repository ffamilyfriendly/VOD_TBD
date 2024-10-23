import { Title } from "@/components/common";
import Entity from "@/components/content/entity";
import { I_MultiViewPage, MultiView } from "@/components/MultiView";
import { Collection } from "@/lib/content";
import { useContext } from "react";
import { FaTint } from "react-icons/fa";
import { FaExpand, FaSquare } from "react-icons/fa6";
import { CollectionContext } from "./page";

export default function Preview() {
  const { item } = useContext(CollectionContext)!;
  const props = item;
  const style = { gridArea: "preview" } as React.CSSProperties;

  const pages: I_MultiViewPage[] = [
    {
      icon: FaTint,
      title: "small",
      page: (
        <Entity size="small" metadata={props.metadata} entity={props.entity} />
      ),
    },
    {
      icon: FaSquare,
      title: "normal",
      page: (
        <Entity size="medium" metadata={props.metadata} entity={props.entity} />
      ),
    },
    {
      icon: FaExpand,
      title: "expanded",
      page: (
        <Entity
          size="expanded"
          metadata={props.metadata}
          entity={props.entity}
        />
      ),
    },
  ];

  return (
    <div style={style}>
      <Title>Preview</Title>
      <MultiView position="center" pages={pages} />
    </div>
  );
}
