import logoOpm from '@/assets/images/logo_OPM.png';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = 'h-10 w-10' }: LogoMarkProps) {
  return (
    <span
      className={`animate-logo-bob flex shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12 ${className}`}
    >
      <img src={logoOpm} alt="" className="h-full w-full object-contain" />
    </span>
  );
}
