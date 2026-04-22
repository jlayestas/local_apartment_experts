"use client";

type Props = {
  onSelect: (iso: string | null) => void;
  labels: {
    today: string;
    plus1: string;
    plus3: string;
    plus7: string;
    clear: string;
  };
};

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function FollowUpQuickActions({ onSelect, labels }: Props) {
  const shortcuts = [
    { label: labels.today, value: addDays(0) },
    { label: labels.plus1, value: addDays(1) },
    { label: labels.plus3, value: addDays(3) },
    { label: labels.plus7, value: addDays(7) },
  ];

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {shortcuts.map(({ label, value }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(value)}
          className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors"
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-400 hover:border-red-200 hover:text-red-500 cursor-pointer transition-colors"
      >
        {labels.clear}
      </button>
    </div>
  );
}
