"use client"
import { useContext, useEffect, useState } from "react"
import Style from "./page.module.css"
import { ClientContext } from "@/components/ClientProvider"
import { I_User } from "@/lib/users"
import { useParams } from "next/navigation"
import { untangle_result } from "@/lib/client"
import { ToastContext } from "@/components/Toast"
import Button from "@/components/button"
import { Modal, styles } from "@/components/common"
import Input from "@/components/input"
import Common from "@/styles/common.module.css"
import { FaCheck } from "react-icons/fa6"

function ChangePassword(props: { id: number }) {
    const client = useContext(ClientContext)
    const toast = useContext(ToastContext);
    const [show_modal, set_show_modal] = useState(false)
    const [current_password, set_current_password] = useState("")
    const [new_password, set_new_password] = useState("")

    function set_password() {
        client.users.update_password(props.id, {
            current_password,
            new_password
        })
        .then(res => {
            untangle_result(
                res,
                (_ok) => {
                    toast?.add_toast({
                        title: "Changed Password",
                        theme: "information",
                        Icon: FaCheck,
                        duration: 5000
                    })
                    set_show_modal(false)
                },
                toast?.from_error
            )
        })
    }

    return <>
        { show_modal && 
        <Modal dismissable={false} title="Set Password" setModal={set_show_modal}>

            <div className={styles(Common.flex, Common.stack, Common.gap_lg)}>
                <div>
                    <Input initial={current_password} set_state={set_current_password} colour="bordered" type="password" label="current password" />
                    <small>if you are an admin you can ignore this field</small>
                </div>
                <Input initial={new_password} set_state={set_new_password} colour="bordered" type="password" label="new password" />

                <div className={styles(Common.flex, Common.justify_right, Common.gap_lg)}>
                    <Button theme="bordered" on_click={() => set_show_modal(false)}>
                        cancel
                    </Button>
                    <Button disabled={!new_password} theme="primary" on_click={set_password}>
                        proceed
                    </Button>
                </div>
            </div>
        </Modal>}
        <Button on_click={() => set_show_modal(true)} theme="primary">Change Password</Button>
    </>
}


export default function UserPage() {
    const client = useContext(ClientContext)
    const toast = useContext(ToastContext);

    const [user, set_user] = useState<I_User>()
    const { id } = useParams();

    if(typeof id !== "string") return <p>faulty</p>

    useEffect(() => {
        client.users.get_user(Number(id))
        .then(res => {
            untangle_result(
                res,
                (data) => set_user(data),
                toast?.from_error
            )
        })
    }, [id])

    return <div>
        <div>
            <div>
                <h1>{user?.name}</h1>
                <small>{user?.email}</small>
            </div>

            <ChangePassword id={Number(id)} />
            
        </div>
    </div>
}