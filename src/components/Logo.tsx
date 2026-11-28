/*
  The logo for React code. It renders the same markup as the string builders in logo.ts, so the
  interface code that builds HTML strings and any React screen show an identical mark.
*/
import { logoLockupHtml, logoMarkSvg, type MarkOptions } from "./logo";

type Props = ({ variant?: "mark" } & MarkOptions) | { variant: "lockup"; size?: number };

export function Logo(props: Props) {
  const html = props.variant === "lockup" ? logoLockupHtml({ size: props.size }) : logoMarkSvg(props);
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
