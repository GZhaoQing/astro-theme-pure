import type { en } from './en'

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>
}

export type Messages = DeepString<typeof en>

export type MessageKey<T = typeof en, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? MessageKey<T[K], `${Prefix}${K}.`>
      : never
}[keyof T & string]
