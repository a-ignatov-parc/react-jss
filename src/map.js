/**
 * Minimal implementation of the Map data structure for old browsers.
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
 */
class CustomMap {
  constructor() {
    this.index = []
    this.content = {}
  }

  find(item) {
    return this.index.indexOf(item)
  }

  has(item) {
    return this.find(item) >= 0
  }

  get(item) {
    return this.content[this.find(item)]
  }

  set(item, value) {
    const itemIndex = this.find(item)
    const index = itemIndex >= 0 ? itemIndex : this.index.push(item) - 1

    this.content[index] = value
    return this
  }
}

/**
 * Use native `Map` if supported and fallback to custom implementation for
 * old browsers.
 */
export default typeof Map !== 'undefined' ? Map : CustomMap
