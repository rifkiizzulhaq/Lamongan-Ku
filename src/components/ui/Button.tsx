interface ButtonProps {
    className?: string;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export default function Button({ className, children, title, disabled, onClick }: ButtonProps) {
    return (
        <button 
            className={`${className || ''}`} 
            onClick={onClick} 
            title={title} 
            disabled={disabled}
        >
            {children}
        </button>
    );
};