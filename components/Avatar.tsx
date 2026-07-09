import { cn } from '@/lib/utils'

// Deterministic gradient pairs — hashed from the username so every user
// gets a stable, unique-looking avatar without storing anything.
const PALETTES = [
  'from-red-500 to-orange-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-fuchsia-600',
  'from-amber-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-lime-500 to-emerald-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-600',
]

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

interface Props {
  username: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
}

export function Avatar({ username, size = 'md', className }: Props) {
  const palette = PALETTES[hash(username.toLowerCase()) % PALETTES.length]
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white uppercase select-none shrink-0',
        palette,
        SIZES[size],
        className
      )}
      title={username}
    >
      {username.slice(0, 2)}
    </span>
  )
}
