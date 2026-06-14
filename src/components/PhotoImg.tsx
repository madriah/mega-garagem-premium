import { useEffect, useState } from "react";
import { signPhoto } from "@/lib/photo-url";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { path: string };

/** Renders a vehicle photo by resolving a signed URL from the stored path/URL. */
export function PhotoImg({ path, ...rest }: Props) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    signPhoto(path).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);
  if (!src) return null;
  return <img src={src} {...rest} />;
}
