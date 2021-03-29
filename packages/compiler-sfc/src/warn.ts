const hasWarned: Record<string, boolean> = {}

export function warnOnce(msg: string) {
  const isNodeProd =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
  if (!isNodeProd && !__TEST__ && !hasWarned[msg]) {
    hasWarned[msg] = true
    warn(msg)
  }
}

export function warn(msg: string) {
  console.warn(
    `\x1b[1m\x1b[33m[@vue/compiler-sfc]\x1b[0m\x1b[33m ${msg}\x1b[0m\n`
  )
}

export function warnExperimental(feature: string, rfcId: number) {
  // eslint-disable-next-line
  if (typeof window !== 'undefined') {
    return
  }
  warnOnce(
    `${feature} is still an experimental proposal.\n` +
      `Follow its status at https://github.com/vuejs/rfcs/pull/${rfcId}.`
  )
  warnOnce(
    `When using experimental features,\n` +
      `it is recommended to pin your vue dependencies to exact versions to avoid breakage.`
  )
}
