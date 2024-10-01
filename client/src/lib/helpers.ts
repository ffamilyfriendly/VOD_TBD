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

export function codec_supported(codec: String): "probably" | "maybe" | false {
  const video = document.createElement("video");

  let answer: CanPlayTypeResult = "";

  if (codec === "aac") {
  }

  switch (codec) {
    case "aac":
      answer = video.canPlayType(`audio/mp4; codecs="mp4a.40.2"`);
      break;
    case "h264":
      answer = video.canPlayType(`video/mp4; codecs="avc1.42E01E"`);
      break;
  }

  if (!answer) return false;
  else return answer;
}
