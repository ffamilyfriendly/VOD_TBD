export class logger {
  module: string;
  constructor(module: string) {
    this.module = module;
  }

  private _log(
    type: string,
    message: string,
    clr: string,
    func: (message?: any, ...optionalParams: any[]) => void
  ) {
    const d = new Date();
    const info_string = `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    func(
      `%c${type}\n%c${message}\n%c${this.module} @ ${info_string}`,
      `color:${clr}; font-size: larger; font-weight: bold; `,
      "font-size: 1em;",
      "color: gray;"
    );
  }

  log(message: string) {
    this._log("LOG", message, "cyan", console.log);
  }

  warn(message: string) {
    this._log("WARNING", message, "orange", console.warn);
  }

  err(message: string) {
    this._log("ERROR", message, "red", console.error);
  }
}
