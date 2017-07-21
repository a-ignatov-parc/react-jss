export default function instanceStore() {
  const map = typeof Map !== 'undefined' && new Map()
  const indices = []
  const content = {}

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
        return this
      }

      const itemIndex = find(item)
      const index = itemIndex >= 0 ? itemIndex : indices.push(item) - 1

      content[index] = value
      return this
    }
  }
}
