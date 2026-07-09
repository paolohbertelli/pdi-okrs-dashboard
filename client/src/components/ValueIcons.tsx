// Value Icons - SVG icons for A&M values
// Design: Corporate Executive Modern — dark, bold, professional

interface IconProps {
  className?: string;
}

export function IntegrityIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 4v5c0 5-3.2 8-7 9-3.8-1-7-4-7-9V7l7-4z" />
      <path d="M9 12l2 2 4-5" />
    </svg>
  );
}

export function QualityIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3z" />
    </svg>
  );
}

export function ObjectivityIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

export function FunIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 10h.01M15.5 10h.01M8.5 14c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2" />
    </svg>
  );
}

export function RewardIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 7H4c0 3 1.5 5 4 5M17 7h3c0 3-1.5 5-4 5" />
    </svg>
  );
}

export function DiversityIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M4 20c.6-3 2-5 4-5s3.4 2 4 5M12 20c.6-3 2-5 4-5s3.4 2 4 5" />
    </svg>
  );
}

export function getValueIcon(name: string, className?: string) {
  const map: Record<string, React.FC<IconProps>> = {
    Integridade: IntegrityIcon,
    Qualidade: QualityIcon,
    Objetividade: ObjectivityIcon,
    Diversão: FunIcon,
    "Recompensa pessoal": RewardIcon,
    "Diversidade inclusiva": DiversityIcon,
  };
  const Icon = map[name];
  return Icon ? <Icon className={className} /> : null;
}
