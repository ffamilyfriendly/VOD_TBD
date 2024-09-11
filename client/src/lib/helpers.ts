import { FormEvent } from "react";
import { Ok, Result } from "./client";

export function use_form_data(d: FormEvent): string[] {
  let res: string[] = [];

  const p = d.currentTarget.querySelectorAll("input");
  for (let i = 0; i < p.length; i++) {
    const node = p[i];

    if (node.value) res.push(node.value);
  }

  return res;
}
