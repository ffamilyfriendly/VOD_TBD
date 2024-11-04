import { ClientContext } from "@/components/ClientProvider";
import { Modal, styles } from "@/components/common";
import Entity from "@/components/content/entity";
import Input from "@/components/input";
import { ToastContext } from "@/components/Toast";
import { Result, untangle_result } from "@/lib/client";
import { EntityType, gen_fake_entity, TmdbMovieResult, TmdbSeriesResult } from "@/lib/content";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import Style from "./tmdb.module.css"
import Common from "@/styles/common.module.css"
import Button from "@/components/button";
import Information from "@/components/Information";

interface I_TmdbSearchBox {
    type: EntityType,
    entity_id?: string,
    set_state: Dispatch<SetStateAction<boolean>>
}

type combined = TmdbMovieResult | TmdbSeriesResult
type dontWorryAboutIt = Result<combined[]>

export default function TmdbSearchBox(props: I_TmdbSearchBox) {
    const [ value, set_value ] = useState("")
    const [selected, set_selected] = useState<combined>()
    const [ results, set_results ] = useState<combined[]>([])
    const client = useContext(ClientContext)
    const toast = useContext(ToastContext);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const res: dontWorryAboutIt = await ((props.type == EntityType.Movie) ?  client.content.search_tmdb_movie(value) :  client.content.search_tmdb_series(value))

            untangle_result(res,
                (val) => {
                    set_results(val)
                },
                toast?.from_error
            )
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [value])

    async function do_thing() {
        if(!selected?.id) return
        const res = (props.entity_id && props.type == EntityType.Movie) ? await client.content.overwrite_movie_meta_from_id(props.entity_id, selected.id) : await client.content.create_series_from_id(selected.id)
        
        untangle_result(res,
            () => {
                props.set_state(false)
                toast?.add_toast({ title: "Updated", children: "The metadata was succesfully updated. Refresh this page to see the changes. Sorry for the hassle", theme: "information", require_dismiss: true })
            },
            toast?.from_error
        )
    }

    function get_title(r: combined): string {
        return (r as TmdbMovieResult)?.title || (r as TmdbSeriesResult)?.name
    }

    function get_release_date(r: combined): string {
        return (r as TmdbMovieResult)?.release_date || (r as TmdbSeriesResult)?.last_air_date
    }

    return <Modal setModal={props.set_state} title="sup" dismissable={true}>
        <Information colour="warning" title="Importing" text="By importing metadata directly from TMDB the current metadata will be overwritten" />
        <Input set_state={set_value} initial={value}  label="Search" type="search" />
        <div className={Style.container}>
            { results.map(r => <div className={styles(Style.selection_box, r.id == selected?.id ? Style.selected : "")} onClick={() => set_selected(r)}> <Entity key={r.id} size="expanded" entity={gen_fake_entity(EntityType.Movie)} metadata={{ metadata_id: "NAN", backdrop: `https://image.tmdb.org/t/p/w780${r.backdrop_path}`, thumbnail: `https://image.tmdb.org/t/p/w780${r.poster_path}`, description: r.overview, title: get_title(r), ratings: r.vote_average, release_date: get_release_date(r)  }} /> </div>) }
        </div>

        <div className={styles(Common.flex, Common.justify_right, Common.gap_lg)}>
            <Button theme="bordered" on_click={() => props.set_state(false)}>
                cancel
            </Button>
            <Button confirm={true} disabled={!selected} theme="primary" on_click={do_thing}>
                import
            </Button>
      </div>
    </Modal>
}