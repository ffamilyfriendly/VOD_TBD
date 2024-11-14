"use client";
import Button from "@/components/button";
import { Title } from "@/components/common";
import { useContext, useEffect, useRef, useState } from "react";
import common from "@/styles/common.module.css";
import { ClientContext } from "@/components/ClientProvider";
import { useRouter } from "next/navigation";
import { MdDeleteForever, MdOpenInFull } from "react-icons/md";
import ContextMenu from "@/components/ContextMenu";
import { create_context_enviroment } from "@/lib/context";
import { ToastContext } from "@/components/Toast";
import {  untangle_result } from "@/lib/client";
import { I_Invite, Invite } from "@/lib/invites";
import Link from "next/link";
import Input from "@/components/input";
import Style from "./page.module.css"

const { Context, Enviroment } = create_context_enviroment<I_Invite[]>();

function UserElement({ data }: { data: I_Invite }) {
  const [show_context, set_show_context] = useState(false);
  const { item, set_item } = useContext(Context)!;
  const [pos, set_pos] = useState<{ top: number; left: number } | null>();
  const r = useRef<HTMLTableCellElement>(null);
  const client = useContext(ClientContext);
  const toast = useContext(ToastContext);

  const invite = new Invite(data)

  const router = useRouter();

  useEffect(() => {
    if (r.current) {
      const position = r.current.getBoundingClientRect();
      set_pos({ top: position.top, left: position.left });
    }
  }, [r, item]);

  async function delete_user() {

    const res = await client.invites.delete_invite(data.id)

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
    router.push(`/admin/invites/${data.id}`);
  }

  return (
    <>
      <tr>
        <td>{data.id}</td>
        <td>{invite.expires.toDateString()}</td>
        <td><Link href={`/client/user/${invite.creator_uid}`}>{invite.creator_username}</Link></td>
        <td>{data.uses}</td>
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

function transform_invite_id(value: string) {
    return value.replace(" ", "-").substring(0, 50)
}

function InvitesCreator() {
    const client = useContext(ClientContext);
    const toast = useContext(ToastContext);
    const { item, set_item } = useContext(Context)!;

    const current_date = (new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)))

    const [id, set_id] = useState("")
    const [expires, set_expires] = useState(current_date.toISOString().split("T")[0])
    const [uses, set_uses] = useState("5")

    async function handle_submit() {
        const date = new Date(expires)

        const req = await client.invites.create_invite(id, date.getTime() / 1000, Number(uses))

        untangle_result(req,
            (new_invite) => { set_item([...item, new_invite]); set_id("") },
            toast?.from_error
        )
    }

    return <section>
        <Title>Create new invite</Title>
        <div className={Style.create_new}>
            <Input transform_value={transform_invite_id} initial={id} set_state={set_id} label="id" type="text" />
            <Input initial={expires} set_state={set_expires} label="expires" type="date" />
            <Input initial={uses} set_state={set_uses} placeholder="5" label="uses" type="number" />
            <Button disabled={!id || !expires || !uses} on_click={handle_submit} theme="primary">create</Button>
        </div>
    </section>
}

export function InvitesTable() {
  return (
    <Enviroment initial_value={[]}>
        <InvitesCreator />
        <_InvitesTable />
    </Enviroment>
  );
}

export function _InvitesTable() {
  const client = useContext(ClientContext);
  const { item, set_item } = useContext(Context)!;
  const toast = useContext(ToastContext);

  useEffect(() => {
    client.invites
        .get_all_invites()
        .then((res) => {
            untangle_result(res,
                (ok) => set_item(ok),
                toast?.from_error
            )
        })
  }, [client.content]);

  return (
    <table className={common.table}>
        <thead>
      <tr>
        <th>id</th>
        <th>expires</th>
        <th>created by</th>
        <th>uses</th>
        <th>options</th>
      </tr>
        </thead>

        <tbody>
            {item?.map((user) => (
                <UserElement key={user.id} data={user} />
            ))}
        </tbody>

    </table>
  );
}

export default function Content() {
  return (
    <main>
      <InvitesTable />
    </main>
  );
}
