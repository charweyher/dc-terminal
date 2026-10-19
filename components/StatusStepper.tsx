import type { FacilityStatus } from "@/lib/types";

const STEPS: Array<{ status: FacilityStatus; label: string }> = [
  { status: "planned", label: "Planned" },
  { status: "under_construction", label: "Under construction" },
  { status: "operating", label: "Operating" },
];

/** Where a facility sits in the build sequence. Cancelled projects show the step they stopped at struck through. */
export default function StatusStepper({ status }: { status: FacilityStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-[12px]">
        <span className="inline-block h-2 w-2 rounded-full bg-danger" aria-hidden />
        <span className="text-fg">Cancelled</span>
        <span className="text-fg-dim line-through">Planned → Under construction → Operating</span>
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.status === status);
  const fill = status === "operating" ? "bg-chart-operating" : "bg-chart-pipeline";

  return (
    <ol className="flex items-center gap-0 text-[12px]" aria-label={`Status: ${STEPS[current].label}`}>
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.status} className="flex items-center">
            {i > 0 ? (
              <span className={`mx-2 h-px w-6 sm:w-10 ${i <= current ? fill : "bg-hairline"}`} aria-hidden />
            ) : null}
            <span
              className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${
                done ? fill : "border border-hairline-strong"
              } ${i === current ? "ring-2 ring-offset-2 ring-offset-bg-0 ring-hairline-strong" : ""}`}
              aria-hidden
            />
            <span className={i === current ? "text-fg" : done ? "text-fg-muted" : "text-fg-dim"}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
