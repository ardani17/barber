export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
} as const

export const gap = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
  '2xl': 'gap-8',
} as const

export const padding = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
  xl: 'p-6',
  '2xl': 'p-8',
} as const

export const margin = {
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-3',
  lg: 'm-4',
  xl: 'm-6',
  '2xl': 'm-8',
} as const

export const responsiveGap = {
  cardGrid: 'gap-3 sm:gap-4',
  formGrid: 'gap-4',
  buttonGroup: 'gap-1 sm:gap-2',
  tabNav: 'gap-2',
  iconText: 'gap-1.5 sm:gap-2',
} as const

export const responsivePadding = {
  card: 'p-3 sm:p-4',
  section: 'p-4 sm:p-6',
  container: 'px-4 sm:px-6 lg:px-8',
} as const

export const responsiveMargin = {
  sectionBottom: 'mb-4 sm:mb-6',
  cardBottom: 'mb-3 sm:mb-4',
  elementBottom: 'mb-2 sm:mb-3',
} as const

export const formLayout = {
  grid2Cols: 'grid grid-cols-1 min-[375px]:grid-cols-2 gap-4',
  grid4Cols: 'grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4',
  fieldSpacing: 'space-y-2',
  formSpacing: 'space-y-4',
} as const

export const touchTarget = {
  minSize: 'min-h-11 min-w-11',
  iconButton: 'h-11 w-11 sm:h-10 sm:w-10',
  button: 'h-11 sm:h-10',
} as const

export const fontSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  responsive: {
    cardTitle: 'text-sm sm:text-base',
    cardValue: 'text-base sm:text-lg',
    badge: 'text-xs sm:text-sm',
  },
} as const

export type SpacingKey = keyof typeof spacing
export type GapKey = keyof typeof gap
export type PaddingKey = keyof typeof padding
export type MarginKey = keyof typeof margin
