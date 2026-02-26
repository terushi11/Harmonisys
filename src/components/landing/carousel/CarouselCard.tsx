const CarouselCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => {
    return (
        <div
            className={`bg-white border-2 rounded-3xl shadow-lg ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default CarouselCard;
