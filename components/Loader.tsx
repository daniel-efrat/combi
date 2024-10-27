import React from "react"

interface LoaderProps {
  className?: string
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className={`loaderContainer ${className || ""}`}>
      <div className="loader">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="loader-dot"
            style={{
              transform: `rotate(${i * 18}deg)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
