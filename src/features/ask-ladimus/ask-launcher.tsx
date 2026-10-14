"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef,useState,useEffect } from "react";
import styles from "./ask.module.css";
import { allowBackdropClose } from "./client-request";
import type { AskRequest } from "./client-request";
const Console=dynamic(()=>import("./ask-console").then(module=>module.AskConsole),{loading:()=> <p role="status">Opening the evidence interface…</p>});
export function AskLauncher(){
  const dialog=useRef<HTMLDialogElement>(null);const opener=useRef<HTMLButtonElement>(null);const [open,setOpen]=useState(false);
  useEffect(()=>{if(open)dialog.current?.showModal();},[open]);
  const busy=useRef(false);const request=useRef<AskRequest|null>(null);
  const close=(reason:"user_abort"|"navigation_abort"="user_abort")=>{request.current?.cancel(reason);dialog.current?.close();};
  return <><button ref={opener} type="button" className={styles.launcher} onClick={()=>setOpen(true)} aria-haspopup="dialog" data-field-reactive>Ask Ladimus <span aria-hidden="true">↗</span></button>
    <dialog ref={dialog} className={styles.drawer} aria-labelledby="ask-drawer-title" onCancel={()=>close()} onClose={()=>{busy.current=false;setOpen(false);opener.current?.focus();}} onClick={event=>{if(allowBackdropClose(busy.current,event.target===event.currentTarget))close();}}>
      <div className={styles.drawerInner}><header className={styles.drawerHead}><div><p className={styles.label}>Ladimus Intelligence</p><h2 id="ask-drawer-title">Ask Ladimus</h2></div><button type="button" onClick={()=>close()} aria-label="Close Ask Ladimus">Close ×</button></header>
        {open && <Console compact onBusyChange={value=>{busy.current=value;}} onRequestChange={value=>{request.current=value;}} />}<Link className={styles.fullLink} href="/ask" onClick={()=>close("navigation_abort")}>Open the full career intelligence experience →</Link>
      </div>
    </dialog></>;
}
