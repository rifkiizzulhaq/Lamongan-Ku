interface ButtonProps {
    className?: string;
    children: React.ReactNode;
    title?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({ className, children, title, type = "button", disabled, onClick }: ButtonProps) {
    return (
        <button
            className={`${className || ''}`}
            onClick={onClick}
            title={title}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    );
};