import Button from "@/components/button";
import { ClientContext } from "@/components/ClientProvider";
import { Title } from "@/components/common";
import { Collection } from "@/lib/content";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { FaEye } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import Common from "@/styles/common.module.css";
import { styles } from "@/components/common";

export default function Actions(props: Collection) {
  const style = { gridArea: "actions" } as React.CSSProperties;
  const client = useContext(ClientContext);
  const router = useRouter();

  function delete_this_entity() {
    client.content.delete_entity(props.entity.entity_id).then((res) => {
      if (res.ok) {
        router.back();
      } else {
        // LOL ERROR HANDLER NEXT YEA PLEASE???
      }
    });
  }

  return (
    <div style={style}>
      <Title>Actions</Title>
      <div
        className={styles(
          Common.flex,
          Common.flex_direction_col,
          Common.gap_lg
        )}
      >
        <Button
          icon={FaEye}
          href={`/client/watch?v=${"hej"}`}
          theme="bordered"
          wide={true}
        >
          Display
        </Button>
        <Button
          icon={FaTrash}
          confirm={true}
          on_click={delete_this_entity}
          theme="error"
          wide={true}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
