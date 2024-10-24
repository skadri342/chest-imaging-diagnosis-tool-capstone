import * as React from "react"
import PropTypes from 'prop-types'
import { cn } from "../../lib/utils"

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      {
        "bg-background text-foreground": variant === "default",
        "bg-destructive text-destructive-foreground": variant === "destructive",
      },
      className
    )}
    {...props} />
))

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'destructive'])
}

Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} />
))

AlertTitle.propTypes = {
  className: PropTypes.string
}

AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} />
))

AlertDescription.propTypes = {
  className: PropTypes.string
}

AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }