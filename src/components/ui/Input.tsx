interface InputProps {
    id: string;
    type?: string;
    className?: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ id, type, className, placeholder, value, required, onchange }: InputProps) {
    return (
        <input
            id={id}
            type={type || "text"}
            className={`${className || ''}`}
            placeholder={placeholder || "Enter text"}
            value={value}
            required={required}
            onChange={onchange}
        />
    );
}