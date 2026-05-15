interface LearningHubMarkProps {
  className?: string;
}

export function LearningHubMark({ className }: LearningHubMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M17 22.5C22.25 22.5 27.15 24.15 31 27.25V46C27.15 42.9 22.25 41.25 17 41.25V22.5Z" fill="currentColor" />
      <path d="M47 22.5C41.75 22.5 36.85 24.15 33 27.25V46C36.85 42.9 41.75 41.25 47 41.25V22.5Z" fill="currentColor" />
      <circle cx="32" cy="18" r="4" fill="currentColor" opacity="0.72" />
      <circle cx="22" cy="16" r="3" fill="currentColor" opacity="0.48" />
      <circle cx="42" cy="16" r="3" fill="currentColor" opacity="0.48" />
      <path d="M24.75 17.2L29.15 18.05M39.25 17.2L34.85 18.05" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
