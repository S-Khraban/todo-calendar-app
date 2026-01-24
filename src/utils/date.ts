export const toLocalIso = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const isoToDate = (iso: string): Date => {
  const parts = iso.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Date(y, m - 1, d)
}

export const isIsoBefore = (isoA: string, isoB: string): boolean => {
  return isoA < isoB
}

export const formatIsoShort = (iso: string): string => {
  const parts = iso.split('-')
  const year = parts[0] ?? '0000'
  const month = parts[1] ?? '00'
  const day = parts[2] ?? '00'
  return `${day}.${month}.${year.slice(2)}`
}

export const formatMonthLabel = (date: Date, locale: string): string =>
  date.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  })

export const formatFullDate = (iso: string, locale: string): string => {
  const d = isoToDate(iso)
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatFullDateUA = (iso: string): string =>
  formatFullDate(iso, 'uk-UA')
