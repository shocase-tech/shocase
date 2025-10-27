import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingLabelInput = ({ 
  label, 
  className,
  value,
  onChange,
  ...props 
}: FloatingLabelInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const isLabelFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <div
        className={cn(
          "relative rounded-lg transition-colors duration-300",
          isFocused ? "bg-[#e8f0fe]" : "bg-[#f5f5f5]",
          className
        )}
        style={{
          paddingTop: '8px',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <label
          htmlFor={props.id}
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-300 ease-in-out",
            isLabelFloating
              ? "top-2 text-[11px] text-[#667eea] uppercase tracking-wide font-medium"
              : "top-4 text-base text-[#999]"
          )}
          style={{
            letterSpacing: isLabelFloating ? '0.05em' : 'normal',
          }}
        >
          {label}
        </label>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full bg-transparent border-none outline-none text-base text-[#111] pt-3",
            "placeholder:text-transparent"
          )}
          {...props}
        />
      </div>
    </div>
  );
};
