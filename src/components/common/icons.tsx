import type { SVGProps } from 'react';

function IconBase({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 5 17.5V19" />
      <circle cx="10" cy="8.5" r="3" />
      <path d="M16.5 14.5a3 3 0 1 0 0-6" />
      <path d="M19 19v-1.5a3 3 0 0 0-1.75-2.73" />
    </IconBase>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5" />
      <path d="M16 3v3.5" />
      <path d="M7.5 13h2.5M7.5 16.5h2.5M11.75 13h2.5M11.75 16.5h2.5M16 13h1M16 16.5h1" />
    </IconBase>
  );
}

export function CalculatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8 7h8" />
      <path d="M8 11.25h.01M12 11.25h.01M16 11.25h.01" />
      <path d="M8 15h.01M12 15h.01M16 15v3" />
      <path d="M8 18.5h.01M12 18.5h.01" />
    </IconBase>
  );
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M11.5 3.5 12.9 8l4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6L5.5 9.4l4.6-1.4 1.4-4.5Z" />
      <path d="M18.4 13.8 19 15.3 20.5 15.9 19 16.5 18.4 18 17.8 16.5 16.3 15.9 17.8 15.3Z" />
    </IconBase>
  );
}

export function AtomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.75" />
      <ellipse cx="12" cy="12" rx="9" ry="3.75" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.75" transform="rotate(120 12 12)" />
    </IconBase>
  );
}

export function GaugeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 14.5a8 8 0 1 1 16 0" />
      <path d="M12 14.5 15.2 9" />
      <path d="M4 14.5h1.5M18.5 14.5H20M6.5 8l1 1M17.5 8l-1 1" />
    </IconBase>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </IconBase>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5.5 8.5 12 15l6.5-6.5" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4.5 12h15" />
      <path d="M13 5.5 19.5 12 13 18.5" />
    </IconBase>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M19.5 12h-15" />
      <path d="M11 5.5 4.5 12l6.5 6.5" />
    </IconBase>
  );
}

export function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 19.5v-15" />
      <path d="M5.5 11 12 4.5 18.5 11" />
    </IconBase>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3 20 20" />
    </IconBase>
  );
}

export function SwordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 19 14.5 9.5" />
      <path d="M13 4.5 19.5 11l-2.5 2.5L10.5 7 13 4.5Z" />
      <path d="M4 20l1.5-1.5" />
    </IconBase>
  );
}

export function BurstIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 2.5v6M12 15.5v6M2.5 12h6M15.5 12h6" />
      <path d="M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
    </IconBase>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 3 19 6v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </IconBase>
  );
}

export function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.25 10c0-1 1.1-1.5 2.75-1.5s2.75.5 2.75 1.5-1.1 1.5-2.75 1.5-2.75.5-2.75 1.5 1.1 1.5 2.75 1.5 2.75-.5 2.75-1.5" />
    </IconBase>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase fill="currentColor" strokeWidth={1} {...props}>
      <path d="M12 3.3 14.5 9l6.2.5-4.7 4 1.4 6-6-3-6.1 3.1L6.6 13l-4.6-4L8 8.7 12 3.3Z" strokeLinejoin="round" />
    </IconBase>
  );
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5" />
    </IconBase>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 12.5 10 17.5 19 6.5" />
    </IconBase>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase fill="currentColor" strokeWidth={1} {...props}>
      <path d="M12 20s-7.2-4.4-9.6-9.1C.9 7.6 2.6 4.3 6 4.3c2.1 0 3.6 1.2 6 3.6 2.4-2.4 3.9-3.6 6-3.6 3.4 0 5.1 3.3 3.6 6.6C19.2 15.6 12 20 12 20Z" />
    </IconBase>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" />
    </IconBase>
  );
}

export function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 4.5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" />
      <path d="M14 15.5 19 12l-5-3.5" />
      <path d="M19 12H9" />
    </IconBase>
  );
}

export function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 4 21 19.5H3L12 4Z" strokeLinejoin="round" />
      <path d="M12 10v4.5" />
      <path d="M12 17.5h.01" />
    </IconBase>
  );
}

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M20.5 16.5 15 11l-8 8" />
    </IconBase>
  );
}
