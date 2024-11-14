"use client"
import { ClientContext } from "@/components/ClientProvider";
import { useRouter } from "next/navigation";
import { useContext } from "react";

export default function RenderPage() {
    const client = useContext(ClientContext)
    const router = useRouter()

    if(client.user?.id) {
        router.push(`/client/user/${client.user.id}`)
    } else {
        router.push(`/login?then=/client/user`)
    }
}