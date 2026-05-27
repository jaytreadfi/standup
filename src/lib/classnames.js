/**
 * Tiny clsx-equivalent. Accepts any mix of strings, booleans, null, undefined,
 * and arbitrarily nested arrays. Falsy values are filtered out automatically.
 *
 * @example
 * cn('foo', false, ['bar', null, ['baz']]) // => 'foo bar baz'
 * cn('base', isActive && 'active')         // => 'base active' | 'base'
 *
 * @param {...(string|boolean|null|undefined|Array<*>)} args
 * @returns {string}
 */
export function cn(...args) {
  return args.flat(Infinity).filter(Boolean).join(' ');
}

export default cn;
