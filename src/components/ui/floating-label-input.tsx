import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, className, value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    const isLabelFloating = isFocused || hasValue;

    return (
      <div className="relative">
        <div
          className={cn(
            "rounded-lg transition-colors duration-300",
            isFocused ? "bg-[#e8f0fe]" : "bg-[#f5f5f5]",
            className
          )}
          style={{
            paddingTop: "8px",
            paddingBottom: "12px",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          <label
            htmlFor={props.id}
            className={cn(
              "absolute left-[16px] pointer-events-none transition-all duration-300 ease-in-out",
              isLabelFloating
                ? "top-[8px] text-[11px] text-[#667eea] uppercase tracking-wider"
                : "top-[16px] text-[16px] text-[#999]"
            )}
            style={{
              fontWeight: isLabelFloating ? 600 : 400,
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
              "w-full bg-transparent border-none outline-none text-[16px] text-[#111]",
              isLabelFloating ? "mt-[12px]" : "mt-0"
            )}
            style={{
              paddingTop: 0,
              paddingBottom: 0,
            }}
            {...props}
          />
        </div>
      </div>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";
