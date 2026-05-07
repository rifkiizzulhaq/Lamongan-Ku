interface InputProps {
  id: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  placeholder?: string;
  value?: string;
  min?: string | number;
  max?: string | number;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  id,
  type,
  inputMode,
  className,
  placeholder,
  value,
  required,
  disabled,
  onChange,
  onchange,
  min,
  max,
}: InputProps) {
  return (
    <input
      id={id}
      type={type || "text"}
      inputMode={inputMode}
      className={`${className || ""}`}
      placeholder={placeholder || ""}
      value={value}
      min={min}
      max={max}
      required={required}
      disabled={disabled}
      onChange={onChange ?? onchange}
    />
  );
}
