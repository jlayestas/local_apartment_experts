"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <p className="text-sm text-gray-600">Ocurrió un error inesperado.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
