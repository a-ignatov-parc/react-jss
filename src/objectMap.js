/**
 * Key/value storage with ability to store objects as keys.
 * Uses `Map` for performance reasons with fallback for old browsers.
 */
export default function objectMap(params) {
  const indices = []
  const content = []
  const map = !(params && params.fallback)
    && typeof Map !== 'undefined'
    && new Map()

  function find(item) {
    return indices.indexOf(item)
  }

  return {
    has(item) {
      return map ? map.has(item) : find(item) >= 0
    },

    get(item) {
      return map ? map.get(item) : content[find(item)]
    },

    set(item, value) {
      if (map) {
        map.set(item, value)
      }
      else {
        const itemIndex = find(item)
        const index = itemIndex >= 0 ? itemIndex : indices.push(item) - 1
        content[index] = value
      }
      return this
    },

    delete(item) {
      if (map) return map.delete(item)

      const itemIndex = find(item)
      const canDelete = itemIndex >= 0

      if (canDelete) {
        indices.splice(itemIndex, 1)
        content.splice(itemIndex, 1)
      }
      return canDelete
    }
  }
}
