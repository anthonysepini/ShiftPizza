export const demoAccounts = [
  { role: 'Admin', cpf: '000.000.000-01', pwd: 'admin123', accent: 'orange' },
  { role: 'João', cpf: '000.000.000-02', pwd: 'joao123', accent: 'amber' },
] as const;

export const accentStyles = {
  orange: {
    badge: 'border-orange-400/25 bg-orange-400/10 text-orange-200',
    line: 'from-orange-400 via-amber-400 to-transparent',
    shadow: 'hover:shadow-[0_16px_40px_rgba(249,115,22,0.18)]',
  },
  amber: {
    badge: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    line: 'from-amber-400 via-orange-300 to-transparent',
    shadow: 'hover:shadow-[0_16px_40px_rgba(245,158,11,0.16)]',
  },
} as const;
