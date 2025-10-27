import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    React.useEffect(() => {
      if (props.value) {
        setHasValue(String(props.value).length > 0)
      }
    }, [props.value])

    return (
      <div className="relative">
        <div
          className={cn(
            "rounded-lg transition-colors duration-300",
            isFocused ? "bg-[#e8f0fe]" : "bg-[#f5f5f5]"
          )}
        >
          <label
            htmlFor={id}
            className={cn(
              "absolute left-4 pointer-events-none transition-all duration-300 ease-out",
              isFocused || hasValue
                ? "top-2 text-[11px] text-[#667eea] uppercase tracking-wide"
                : "top-4 text-base text-[#999]"
            )}
          >
            {label}
          </label>
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-transparent border-none outline-none text-base text-[#111] pt-6 pb-3 px-4",
              "placeholder:text-transparent",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        </div>
      </div>
    )
  }
)
FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
