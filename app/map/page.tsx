import Panel from "@/components/Panel";
import MapExplorer from "@/components/MapExplorer";
import { loadFacilities } from "@/lib/data";
import { toMapData } from "@/lib/mapPoints";

export const metadata = { title: "Map — DC Terminal" };

export default function MapPage() {
  const data = toMapData(loadFacilities());
  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">Map</h1>
      <Panel title="US Data Centers — Interactive Map">
        <MapExplorer data={data} />
      </Panel>
    </div>
  );
}
