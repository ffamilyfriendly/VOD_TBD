import { I_Common, styles } from "./common";
import Style from "./ProgressBar.module.css";

interface I_ProgressBar extends I_Common {
  max?: number;
  value: number;
  inner_text?: string;
}

export default function ProgressBar({
  max = 100,
  value,
  ...props
}: I_ProgressBar) {
  const width = (value / max) * 100;
  return (
    <div
      className={styles(Style.progress_bar, Style[props.colour || "primary"])}
    >
      <div style={{ width: `${width}%` }} className={Style.inner}>
        <p>{props.inner_text}</p>
      </div>
    </div>
  );
}
