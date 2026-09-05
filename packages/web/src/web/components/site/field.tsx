import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

export function Label({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-2 block text-sm font-medium text-muted", className)}>
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
  className,
  hint,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Input(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select {...props} className={cn(inputClass, "appearance-none bg-[right_1rem_center] pr-10", props.className)}>
      {props.children}
    </select>
  );
}

export function Textarea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-28 resize-y", props.className)} />;
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-2/60 p-3 transition hover:border-primary/40">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-[var(--primary)]"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}
