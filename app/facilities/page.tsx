import Panel from "@/components/Panel";
import FacilityTable from "@/components/FacilityTable";
import { loadFacilities } from "@/lib/data";
import { toFacilityRows } from "@/lib/tableRows";

export const metadata = { title: "Facilities — DC Terminal" };

export default function FacilitiesPage() {
  const rows = toFacilityRows(loadFacilities());
  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">
        Facilities
      </h1>
      <Panel title="Facility Table">
        <FacilityTable rows={rows} />
      </Panel>
    </div>
  );
}
