interface InputProps {
    id: string;
    type?: string;
    className?: string;
    placeholder?: string;
    onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ id, type, className, placeholder, onchange }: InputProps) {
    return (
        <input
            id={id}
            type={type || "text"}
            className={`${className || ''}`}
            placeholder={placeholder || "Enter text"}
            onChange={onchange}
        />
    );
}