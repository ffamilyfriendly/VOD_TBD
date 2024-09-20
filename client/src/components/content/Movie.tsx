import Style from "./Movie.module.css";

interface I_Movie {
  size: "large" | "small";
  thumbnail: `https://${string}`;
  backdrop: `https://${string}`;
}

// thumbnail: https://www.themoviedb.org/t/p/w600_and_h900_bestv2/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg
// backdrop: https://image.tmdb.org/t/p/original/hO7KbdvGOtDdeg0W4Y5nKEHeDDh.jpg

export function BigMovie({ ...props }: I_Movie) {
  return <div className={Style.container_big}></div>;
}

export function SmallMovie({ ...props }: I_Movie) {
  return <div></div>;
}

export default function Movie(props: I_Movie) {
  return props.size === "large" ? (
    <BigMovie {...props} />
  ) : (
    <SmallMovie {...props} />
  );
}
