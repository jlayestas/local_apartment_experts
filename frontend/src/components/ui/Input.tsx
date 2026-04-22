import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label?: string;
  error?: string;
  hint?: string;
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & { multiline?: false };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
    rows?: number;
  };

type Props = InputProps | TextareaProps;

const fieldClass = (error?: string) =>
  `block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors
   placeholder:text-gray-400
   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
   disabled:bg-gray-50 disabled:text-gray-500
   ${error ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-300 bg-white"}`;

export default function Input({ label, error, hint, ...props }: Props) {
  const id =
    props.id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  let field: React.ReactNode;
  if ("multiline" in props && props.multiline) {
    // Destructure multiline out so it is never passed to the DOM element.
    const { multiline: _m, rows, ...rest } = props as TextareaProps;
    field = (
      <textarea
        id={id}
        rows={rows ?? 3}
        className={fieldClass(error)}
        {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  } else {
    field = (
      <input
        id={id}
        className={fieldClass(error)}
        {...(props as InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {field}

      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
