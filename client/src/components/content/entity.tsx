import {
  EntityType,
  Entity as I_EntityObject,
  MetaData,
  Tag,
  to_entitytype,
} from "@/lib/content";
import Style from "./entity.module.css";
import { styles, Title } from "../common";

interface I_Entity {
  size: "small" | "medium" | "expanded";
  entity: I_EntityObject;
  metadata: MetaData;
  tags?: Tag[];
}

function SmallEntity({ metadata, entity, ...props }: I_Entity) {
  return (
    <div className={styles(Style.entity)}>
      <div
        style={{ backgroundImage: `url(${metadata.thumbnail})` }}
        className={Style.small_img}
      ></div>
    </div>
  );
}

function MediumEntity({ metadata, entity, ...props }: I_Entity) {
  return (
    <div className={styles(Style.entity)}>
      <img className={Style.entity_image} src={metadata.backdrop} />
    </div>
  );
}

function SeriesLikeChildren(props: I_EntityObject) {
  return (
    <p>
      {props.children}{" "}
      {to_entitytype(props.entity_type as unknown as string) ==
      EntityType.Series
        ? "Seasons"
        : "Episodes"}
    </p>
  );
}

function PlayableLikeDuration(props: I_EntityObject) {
  return <p>DURATION hours</p>;
}

function ExpandedEntity({ metadata, entity, ...props }: I_Entity) {
  const as_entity_type = to_entitytype(entity.entity_type as unknown as string);
  return (
    <div className={styles(Style.entity)}>
      <div
        style={{ backgroundImage: `url(${metadata.thumbnail})` }}
        className={Style.small_img}
      ></div>
      <div>
        <div className={Style.title_row}>
          <Title>{metadata.title}</Title>
          {as_entity_type == EntityType.Movie ||
          as_entity_type == EntityType.SeriesEpisode ? (
            <PlayableLikeDuration {...entity} />
          ) : (
            <SeriesLikeChildren {...entity} />
          )}
        </div>

        <p className={Style.description}>{metadata.description}</p>
      </div>
    </div>
  );
}

export default function Entity(props: I_Entity) {
  switch (props.size) {
    case "small":
      return <SmallEntity {...props} />;
      break;
    case "medium":
      return <MediumEntity {...props} />;
      break;
    case "expanded":
      return <ExpandedEntity {...props} />;
      break;
  }
}
