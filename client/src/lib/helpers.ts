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

/**
 * Takes a milisecond value and returns a formatted string
 * @example ms_to_time(2000) -> "2 seconds"
 * @param ms value in miliseconds
 */
export function ms_to_time(ms: number): string {
  const as_hours = ms / 1000 / 60 / 60;
  const as_minutes = ms / 1000 / 60;
  const as_seconds = ms / 1000;

  if (as_hours > 1) return `${as_hours.toFixed(2)} hours`;
  if (as_minutes > 1) return `${as_minutes.toFixed(2)} minutes`;
  if (as_seconds > 1) return `${as_seconds.toFixed(2)} seconds`;
  return `${ms.toFixed(2)} milliseconds`;
}
