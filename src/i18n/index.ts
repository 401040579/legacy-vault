import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import en from './en'
import zh from './zh'

export type Locale = 'en' | 'zh'

type Translations = typeof en

const translations: Record<Locale, Translations> = { en, zh: zh as unknown as Translations }

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale: Locale) => {
        set({ locale })
        document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
      },
    }),
    { name: 'legacy-vault-i18n' }
  )
)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path
    }
    current = (current as Record<string, unknown>)[key]
  }
  if (typeof current === 'string') return current
  if (Array.isArray(current)) return current as unknown as string
  return path
}

export function useI18n() {
  const { locale, setLocale } = useI18nStore()
  const dict = translations[locale]

  function t(key: string, params?: Record<string, string | number>): string {
    let value = getNestedValue(dict as unknown as Record<string, unknown>, key)
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        value = (value as string).replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }
    return value as string
  }

  function tArray(key: string): string[] {
    const keys = key.split('.')
    let current: unknown = dict
    for (const k of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return []
      }
      current = (current as Record<string, unknown>)[k]
    }
    if (Array.isArray(current)) return current as string[]
    return []
  }

  return { t, tArray, locale, setLocale }
}

export function getLocaleForDate(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : 'en-US'
}
