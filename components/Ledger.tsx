import Link from "next/link";
import ChartTooltip from "@/components/charts/ChartTooltip";
import LedgerReveal from "@/components/LedgerReveal";
import { buildLedger } from "@/lib/rollups";
import type { Confidence, Facility } from "@/lib/types";

const fmt = new Intl.NumberFormat("en-US");

const CONF_LABEL: Record<Confidence, string> = {
  confirmed: "Confirmed",
  reported: "Reported",
  estimated: "Estimated",
  unknown: "Not public",
};

const KEY_ORDER: Confidence[] = ["confirmed", "reported", "estimated", "unknown"];

/**
 * Every facility (column) × every key fact (row), each cell lit by how well that
 * fact is sourced. Columns run from most to least complete; click one to open it.
 */
export default function Ledger({ facilities }: { facilities: Facility[] }) {
  const { fields, columns, totals, cellCount, knownCount } = buildLedger(facilities);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p className="max-w-xl text-[13px] text-fg-muted">
          <span className="text-2xl font-semibold text-fg">{fmt.format(knownCount)}</span>{" "}
          of {fmt.format(cellCount)} key facts are sourced across {facilities.length} facilities.
          Each column is a facility, each row a fact. Gaps stay visible until a public source fills
          them.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-fg-muted">
          {KEY_ORDER.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className="ledger-cell inline-block" data-c={c} aria-hidden />
              {CONF_LABEL[c]}
              <span className="font-mono tabular-nums text-fg-dim">{totals[c]}</span>
            </span>
          ))}
        </div>
      </div>

      <LedgerReveal>
        <ChartTooltip className="overflow-x-auto pb-1">
          <div className="flex w-max gap-[3px]">
            <div className="sticky left-0 z-10 flex flex-col gap-[2px] bg-bg-1 pr-3">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="flex h-3 items-center justify-end whitespace-nowrap text-[11px] leading-none text-fg-muted"
                >
                  {field.label}
                </div>
              ))}
            </div>
            {columns.map((col, i) => (
              <Link
                key={col.facility.id}
                href={`/facilities/${col.facility.id}`}
                aria-label={`${col.facility.name}: ${col.known} of ${fields.length} key facts sourced`}
                className="ledger-col flex flex-col gap-[2px] rounded-[1px]"
                style={{ "--i": i } as React.CSSProperties}
              >
                {col.cells.map((cell) => (
                  <span
                    key={cell.field.key}
                    className="ledger-cell block"
                    data-c={cell.confidence}
                    data-tip={`${col.facility.name}\n${cell.field.label}: ${CONF_LABEL[
                      cell.confidence
                    ].toLowerCase()}${cell.asOf && cell.confidence !== "unknown" ? ` (as of ${cell.asOf})` : ""}\n${col.known} of ${fields.length} facts sourced`}
                  />
                ))}
              </Link>
            ))}
          </div>
        </ChartTooltip>
      </LedgerReveal>
    </div>
  );
}
