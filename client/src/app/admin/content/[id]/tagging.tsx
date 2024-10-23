/**
 * DEEP APOLOGIES TO ANYONE READING THIS
 * this file is a proper mess.
 */

import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import Input from "@/components/input";
import { Tag } from "@/lib/content";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import Style from "./tagging.module.css";
import Button from "@/components/button";
import { BiInfoCircle } from "react-icons/bi";
import Information from "@/components/Information";
import { FaPlusCircle } from "react-icons/fa";

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function TagElement(
  props: Tag & { show_delete?: boolean; on_click?: () => void }
) {
  const as_rgb = hexToRgb(props.colour);
  const style = {
    "--tag_colour": `${as_rgb?.r}, ${as_rgb?.g}, ${as_rgb?.b}`,
  } as React.CSSProperties;
  return (
    <div className={Style.tag_element} style={style}>
      {props.title}
      {props.show_delete && (
        <button onClick={props.on_click} className={Style.tag_remove_button}>
          x
        </button>
      )}
    </div>
  );
}

export function AppliableTag(
  props: Tag & {
    on_click: () => void;
    editable_colour?: string;
    set_editable_colour?: Dispatch<SetStateAction<string>>;
  }
) {
  const colour = props.editable_colour ?? props.colour;

  const style = {
    backgroundColor: colour,
    height: "1em",
    width: "1em",
    borderRadius: "50%",
    cursor: "pointer",
  } as React.CSSProperties;

  function change_colour() {
    const input = document.createElement("input");
    input.type = "color";

    input.click();

    input.onchange = (ev) => {
      const target = ev.target as HTMLInputElement;

      if (props.set_editable_colour) {
        props.set_editable_colour(target.value);
      }
    };
  }

  return (
    <div className={Style.appliable_tag}>
      <button onClick={props.on_click}>
        <FaPlusCircle />
      </button>
      {props.editable_colour && (
        <div onClick={() => change_colour()} style={style}></div>
      )}
      <TagElement
        show_delete={false}
        tag_id={props.tag_id}
        title={props.title}
        colour={colour}
      />
    </div>
  );
}

export function Tagging(props: { entity_id: string }) {
  const [query, set_query] = useState("");
  const [results, set_results] = useState<Tag[]>([]);
  const [applied_tags, set_applied_tags] = useState<Tag[]>([]);
  const client = useContext(ClientContext);

  const [colour, set_colour] = useState("#FFBCFF");

  useEffect(() => {
    if (query) {
      client.content.query_tags(query).then((res) => {
        if (res.ok) {
          console.log("[QUERY YIELDED]", res.value);
          set_results(res.value);
        } else {
          //handle
        }
      });
    }
  }, [query, client.content]);

  useEffect(() => {
    client.content.get_entity_tags(props.entity_id).then((res) => {
      if (res.ok) {
        set_applied_tags(res.value);
      } else {
        // really gotta handle errors
      }
    });
  }, [client.content, props.entity_id]);

  function apply_tag(tag: Tag) {
    client.content
      .add_tag_to_entity(props.entity_id, tag.tag_id)
      .then((res) => {
        if (res.ok) {
          set_applied_tags([...applied_tags, tag]);
          set_results((tags) => {
            const applied_tag_removed_array = tags.filter(
              (t) => t.tag_id != tag.tag_id
            );
            return applied_tag_removed_array;
          });
        } else {
          alert("cum");
          //please
        }
      });
  }

  function remove_tag(tag: Tag) {
    client.content
      .remove_tag_from_entity(props.entity_id, tag.tag_id)
      .then((res) => {
        if (res.ok) {
          set_applied_tags((tags) => {
            const removed_tag_array = tags.filter(
              (t) => t.tag_id != tag.tag_id
            );
            return removed_tag_array;
          });
        } else {
          // PLEASE
        }
      });
  }

  function create_tag() {
    client.content.create_tag(query, colour).then((res) => {
      if (res.ok) {
        apply_tag(res.value);
        set_query("");
      } else {
        // you know the drill lol
      }
    });
  }

  return (
    <div className={Style.tagging}>
      <Title>Tags</Title>
      <p>
        {" "}
        <BiInfoCircle /> Tags are used to find suggestions for users to watch.
        The more tags the better as long as they are accurate
      </p>
      <h2>Applied tags</h2>
      <div style={{ display: "flex" }}>
        {applied_tags.map((tag) => (
          <TagElement
            key={tag.tag_id}
            on_click={() => remove_tag(tag)}
            show_delete={true}
            {...tag}
          />
        ))}
      </div>

      <h2>Apply tag</h2>
      <Input
        initial={query}
        set_state={set_query}
        label="Add tag"
        type="search"
        placeholder="search..."
      ></Input>
      <div className="help">
        {results
          .filter((res) => !applied_tags.find((t) => t.tag_id == res.tag_id))
          .map((r) => (
            <AppliableTag on_click={() => apply_tag(r)} key={r.tag_id} {...r} />
          ))}

        {query && (
          <>
            <small>Create new tag</small>
            <AppliableTag
              on_click={() => create_tag()}
              tag_id="not_apl"
              title={query}
              colour=""
              editable_colour={colour}
              set_editable_colour={set_colour}
            />
          </>
        )}
      </div>
    </div>
  );
}
