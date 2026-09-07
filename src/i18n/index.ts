import { en } from './en'
import type { MessageKey, Messages } from './types'
import { zh } from './zh'

export type { MessageKey, Messages }
export type Locale = 'en' | 'zh'

export const locales = { en, zh } as const satisfies Record<Locale, Messages>

export function localeFromLang(lang?: string): Locale {
  return (lang ?? 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function flattenMessages(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') {
      Object.assign(out, flattenMessages(value as Record<string, unknown>, path))
    } else {
      out[path] = String(value)
    }
  }
  return out
}

export const flatLocales: Record<Locale, Record<string, string>> = {
  en: flattenMessages(en),
  zh: flattenMessages(zh)
}

export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`
  )
}

export function t(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>
): string {
  const raw = flatLocales[locale][key] ?? flatLocales.en[key] ?? key
  return interpolate(raw, params)
}

export function applyTranslations(root: ParentNode = document, locale: Locale) {
  const dict = flatLocales[locale]
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (!key) return
    const raw = dict[key]
    if (raw === undefined) return
    let params: Record<string, string | number> | undefined
    const rawParams = el.getAttribute('data-i18n-params')
    if (rawParams) {
      try {
        params = JSON.parse(rawParams) as Record<string, string | number>
      } catch {
        /* ignore invalid params */
      }
    }
    const text = interpolate(raw, params)
    const attr = el.dataset.i18nAttr
    if (attr) el.setAttribute(attr, text)
    else el.textContent = text
  })

  const titleKey = document.querySelector('meta[name="i18n-title"]')?.getAttribute('content')
  if (titleKey && dict[titleKey]) {
    const brand = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
    const delimiter =
      document.querySelector('meta[name="i18n-delimiter"]')?.getAttribute('content') ?? '•'
    document.title = brand ? `${dict[titleKey]} ${delimiter} ${brand}` : dict[titleKey]
  }
}
