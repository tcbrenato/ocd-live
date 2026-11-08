import type { StepId } from '@/data/types';

interface StepIndicatorProps {
  steps: Array<{ id: StepId; label: string }>;
  current: StepId;
  onGoTo: (id: StepId) => void;
  maxReached: number;
}

export default function StepIndicator({
  steps,
  current,
  onGoTo,
  maxReached,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Étapes de réservation">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isActive = step.id === current;
          const isDone = index < currentIndex;
          const isReachable = index <= maxReached;

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => isReachable && onGoTo(step.id)}
                disabled={!isReachable}
                className="flex items-center gap-2 transition-opacity"
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-ocd-orange text-ocd-anthracite'
                      : isDone
                        ? 'bg-ocd-anthracite text-white'
                        : 'bg-ocd-paper text-ocd-anthracite/40'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    isActive
                      ? 'text-ocd-anthracite'
                      : isDone
                        ? 'text-ocd-anthracite/70'
                        : 'text-ocd-anthracite/40'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={`h-px w-4 sm:w-8 ${
                    isDone ? 'bg-ocd-anthracite' : 'bg-ocd-line'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
