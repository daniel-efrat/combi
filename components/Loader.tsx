import React from "react"

interface LoaderProps {
  className?: string
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className={`loaderContainer ${className || ""}`}>
      <div className="loader">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties}></span>
        ))}
      </div>
    </div>
  )
}
