import { ReactNode } from 'react'

interface SectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function Section({ title, children, className = '' }: SectionProps) {
  return (
    <div className={`p-6 rounded-2xl ${className}`}>
      <h2 className="text-2xl font-mono font-semibold mb-6 underline decoration-2 underline-offset-4">
        {title}
      </h2>
      {children}
    </div>
  )
}
