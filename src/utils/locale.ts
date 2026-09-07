import { applyTranslations, type Locale } from '@/i18n'

export type SiteLocale = Locale

/** User-chosen locale. IP detection uses cookie `locale-geo` and must not write this key. */
const STORAGE_KEY = 'locale'

export function getLocale(): SiteLocale | null {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'zh' || value === 'en' ? value : null
}

export function resolveLocale(fallback: SiteLocale = 'en'): SiteLocale {
  const stored = getLocale()
  if (stored) return stored
  const fromDom = document.documentElement.getAttribute('data-locale')
  if (fromDom === 'zh' || fromDom === 'en') return fromDom
  return fallback
}

export function applyLocale(locale: SiteLocale) {
  document.documentElement.setAttribute('data-locale', locale)
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en-US'
}

export function setLocale(locale?: SiteLocale, save = false): SiteLocale {
  if (!locale) {
    locale = resolveLocale() === 'zh' ? 'en' : 'zh'
  }
  if (save) {
    localStorage.setItem(STORAGE_KEY, locale)
    document.cookie = `${STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`
  }
  applyLocale(locale)
  applyTranslations(document, locale)
  document.dispatchEvent(new CustomEvent('locale-change', { detail: { locale } }))
  return locale
}
