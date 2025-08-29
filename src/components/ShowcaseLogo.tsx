interface ShowcaseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ShowcaseLogo = ({ className = "", size = 'md' }: ShowcaseLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-20 md:h-32"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center`}>
        {/* Circle with A */}
        <div className="w-8 h-8 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center mr-2 md:mr-3">
          <span className="text-primary-foreground font-bold text-sm md:text-lg">A</span>
        </div>
        {/* SHOCASE text */}
        <div className="flex flex-col">
          <span className="text-primary font-bold text-lg md:text-3xl leading-none">SHOCASE</span>
          <span className="text-primary text-sm md:text-lg">.xyz</span>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseLogo;