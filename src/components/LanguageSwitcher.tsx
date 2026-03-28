import { useI18n, type Locale } from '../i18n'

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n()

  const toggle = () => {
    const next: Locale = locale === 'en' ? 'zh' : 'en'
    setLocale(next)
  }

  return (
    <button
      onClick={toggle}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white ${className}`}
      title={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  )
}
