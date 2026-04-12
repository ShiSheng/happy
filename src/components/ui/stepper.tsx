import { cn } from "@/lib/utils";

type Step = { id: string; label: string; active: boolean; done: boolean };

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-muted">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          {i > 0 ? (
            <span className="text-line-strong" aria-hidden>
              →
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-full px-3 py-1.5",
              s.done && "bg-bubble text-peach",
              s.active && !s.done && "bg-bubble text-coral",
              !s.active && !s.done && "bg-surface-muted text-ink-muted",
            )}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
