"use client";
import Button from "@/components/button";
import { Title } from "@/components/common";
import { useContext, useEffect, useRef, useState } from "react";
import common from "@/styles/common.module.css";
import { ClientContext } from "@/components/ClientProvider";
import { Collection, EntityType } from "@/lib/content";
import { useRouter } from "next/navigation";
import { MdDeleteForever, MdOpenInFull } from "react-icons/md";
import ContextMenu from "@/components/ContextMenu";
import { create_context_enviroment, I_GenericContext } from "@/lib/context";
import { ToastContext } from "@/components/Toast";
import { if_error, untangle_result } from "@/lib/client";
import { I_User } from "@/lib/users";

const { Context, Enviroment } = create_context_enviroment<I_User[]>();

function UserElement({ data }: { data: I_User }) {
  const [show_context, set_show_context] = useState(false);
  const { item, set_item } = useContext(Context)!;
  const [pos, set_pos] = useState<{ top: number; left: number } | null>();
  const r = useRef<HTMLTableCellElement>(null);
  const client = useContext(ClientContext);
  const toast = useContext(ToastContext);

  const router = useRouter();

  useEffect(() => {
    if (r.current) {
      const position = r.current.getBoundingClientRect();
      set_pos({ top: position.top, left: position.left });
    }
  }, [r, item]);

  async function delete_user() {

    const res = await client.users.delete_user(data.id)

    untangle_result(res,
        (_nr) => {
            set_item((elements) => {
                const rv = elements.filter((el) => el.id != data.id)
                return rv
            })
        },
        toast?.from_error
    )
  }

  function view_entity() {
    router.push(`/client/user/${data.id}`);
  }

  return (
    <>
      <tr>
        <td>{data.id}</td>
        <td>{data.email}
            {data.id == client.user?.id ? <p><small>this is you</small></p> : ""}
        </td>
        <td>{data.name}</td>
        <td>{data.used_invite}</td>
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
              on_click: view_entity,
            },
            {
              text: "Delete",
              icon: MdDeleteForever,
              on_click: delete_user,
            },
          ]}
        />
      )}
    </>
  );
}

export function UserTable() {
  return (
    <Enviroment initial_value={[]}>
      <_UserTable />
    </Enviroment>
  );
}

export function _UserTable() {
  const client = useContext(ClientContext);
  const { item, set_item } = useContext(Context)!;
  const toast = useContext(ToastContext);

  useEffect(() => {
    client.users
        .get_all_users()
      .then((res) => {
        if (res.ok) {
          set_item(res.value);
        } else {
          toast?.from_error(res)
        }
      });
  }, [client.content]);

  return (
    <table className={common.table}>
      <tr>
        <th>id</th>
        <th>email</th>
        <th>name</th>
        <th>invite used</th>
        <th>options</th>
      </tr>

      {item?.map((user) => (
        <UserElement key={user.id} data={user} />
      ))}
    </table>
  );
}

export default function Content() {
  return (
    <main>
      <UserTable />
    </main>
  );
}
