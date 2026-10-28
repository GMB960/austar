import { useEffect, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SatelliteMap({ selected }: { selected: "NSW" | "VIC" }) {
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    const host = window.location.hostname;
    setAuthorized(host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com"));
  }, []);
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const center = selected === "NSW" ? "-33.5,147.5" : "-37,144.5";
  const name = selected === "NSW" ? "New South Wales" : "Victoria";
  const url = `https://www.google.com/maps/embed/v1/view?key=${key}&center=${center}&zoom=${selected === "NSW" ? 6 : 7}&maptype=satellite`;
  return <div className="relative h-full w-full overflow-hidden rounded-md border border-ivory/15 bg-forest-deep">
    {authorized && key ? <iframe
      key={selected}
      title={`${name} satellite map`}
      src={url}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    /> : <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <MapPin className="size-8 text-leaf-soft" />
      <p className="font-display text-lg text-ivory">{name} · Satellite view</p>
      <p className="max-w-xs text-sm leading-relaxed text-ivory/60">Satellite imagery is available on the Lovable preview and published Lovable address.</p>
      <Button asChild variant="outline"><a href={`https://www.google.com/maps/@?api=1&map_action=map&center=${center}&zoom=7&basemap=satellite`} target="_blank" rel="noopener noreferrer">Open satellite map<ArrowUpRight /></a></Button>
    </div>}
  </div>;
}