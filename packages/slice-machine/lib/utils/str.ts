import camelCase from 'lodash/camelCase'

const camelizeRE = /-(\w)/g;
export function pascalize(str: string): string {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
  return str[0].toUpperCase() + str.slice(1);
}

const hyphenateRE = /\B([A-Z])/g;
export function hyphenate(str: string): string {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}

export function snakelize(str: string): string {
  return hyphenate(str).replace(/-/g, '_');
}

export function createStorybookId(str: string): string {
  return `_${camelCase(str)}`
}

export function camelCaseToDash(v: any): string {
  let ret = '', prevLowercase = false, prevIsNumber = false
  for (let s of v) {
    const isUppercase = s.toUpperCase() === s
    const isNumber = !isNaN(s)
    if (isNumber) {
      if (prevLowercase) {
        ret += '-'
      }
    } else {
      if (isUppercase && (prevLowercase || prevIsNumber)) {
        ret += '-'
      }
    }
    ret += s
    prevLowercase = !isUppercase
    prevIsNumber = isNumber
  }
  return ret.replace(/-+/g, '-').toLowerCase()
}