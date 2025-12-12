import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'teal' | 'orange'
  className?: string
  children?: React.ReactNode
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({
    id,
    checked = false,
    onCheckedChange,
    disabled = false,
    size = 'md',
    color = 'blue',
    className,
    children,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
      lg: 'h-6 w-11'
    }

    const thumbSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    const colorClasses = {
      blue: 'peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600',
      green: 'peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-600',
      red: 'peer-focus:ring-red-300 dark:peer-focus:ring-red-800 peer-checked:bg-red-600',
      purple: 'peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600',
      yellow: 'peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:bg-yellow-400',
      teal: 'peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:bg-teal-600',
      orange: 'peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:bg-orange-500'
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }

    return (
      <label className={cn("inline-flex items-center cursor-pointer", disabled && "cursor-not-allowed opacity-50", className)}>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-blue-600" : "bg-gray-200",
          sizeClasses[size]
        )}>
          <div className={cn(
            "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-full" : "translate-x-0",
            thumbSizeClasses[size]
          )} />
        </div>
        {children && (
          <span className={cn(
            "ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 select-none",
            disabled && "text-gray-400 dark:text-gray-600"
          )}>
            {children}
          </span>
        )}
      </label>
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle }