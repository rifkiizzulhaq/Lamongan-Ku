interface ButtonProps {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function Button({ className, children, onClick }: ButtonProps) {
    return (
        <button className={`${className || ''}`} onClick={onClick}>
            {children}
        </button>
    );
};