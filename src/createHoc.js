import React, {Component} from 'react'
import {object, instanceOf} from 'prop-types'
import {SheetsRegistry, getDynamicStyles} from 'jss'
import jss from './jss'
import compose from './compose'
import getDisplayName from './getDisplayName'

const refNs = `ref-${String(Math.random()).substr(2)}`
const refs = sheet => sheet[refNs] || 0
const dec = sheet => --sheet[refNs]
const inc = sheet => ++sheet[refNs]

/**
 * Wrap a Component into a JSS Container Component.
 *
 * @param {Object|StyleSheet} stylesOrSheet
 * @param {Component} InnerComponent
 * @param {Object} [options]
 * @return {Component}
 */
export default (stylesOrSheet, InnerComponent, options = {}) => {
  const stylesIsInstance = stylesOrSheet && typeof stylesOrSheet.attach === 'function'
  const displayName = getDisplayName(InnerComponent)
  const staticSheetCache = new Map()

  if (!options.meta) options.meta = displayName

  const dynamicSheetOptions = {
    ...options,
    meta: `${options.meta}Dynamic`,
    link: true
  }

  return class Jss extends Component {
    static InnerComponent = InnerComponent

    static displayName = `Jss(${displayName})`

    static contextTypes = {
      jss: instanceOf(jss.constructor),
      jssSheetOptions: object,
      jssSheetsRegistry: instanceOf(SheetsRegistry)
    }

    static defaultProps = InnerComponent.defaultProps

    componentWillMount() {
      const {
        jssSheetOptions,
        jssSheetsRegistry,
      } = this.context

      const localJss = this.getJss()

      if (stylesIsInstance) {
        this.staticSheet = stylesOrSheet
      } else if (staticSheetCache.has(jssSheetsRegistry)) {
        this.staticSheet = staticSheetCache.get(jssSheetsRegistry)
      } else {
        this.staticSheet = localJss.createStyleSheet(stylesOrSheet, {...options, ...jssSheetOptions})
        staticSheetCache.set(jssSheetsRegistry, this.staticSheet)
      }

      if (!stylesIsInstance && !this.dynamicSheet) {
        this.dynamicSheet = localJss.createStyleSheet(compose(this.staticSheet, getDynamicStyles(stylesOrSheet)), {
          ...dynamicSheetOptions,
          ...jssSheetOptions
        })
      }

      if (this.staticSheet[refNs] === undefined) this.staticSheet[refNs] = 0
      if (refs(this.staticSheet) === 0) this.staticSheet.attach()
      inc(this.staticSheet)

      if (this.dynamicSheet) {
        this.dynamicSheet.update(this.props)
        this.dynamicSheet.attach()
      }
      this.addToRegistry(jssSheetsRegistry)
    }

    addToRegistry(registry) {
      if (!registry) return
      registry.add(this.staticSheet)
      if (this.dynamicSheet) registry.add(this.dynamicSheet)
    }

    componentWillReceiveProps(nextProps, nextContext) {
      if (nextContext.jssSheetsRegistry !== this.context.jssSheetsRegistry) {
        this.addToRegistry(nextContext.jssSheetsRegistry)
      }
      if (this.dynamicSheet) this.dynamicSheet.update(nextProps)
    }

    componentWillUnmount() {
      if (this.staticSheet && !stylesIsInstance) {
        this.staticSheet.detach()
        const {jssSheetsRegistry} = this.context
        if (jssSheetsRegistry) jssSheetsRegistry.remove(this.staticSheet)
      } else if (dec(this.staticSheet) === 0) {
        this.staticSheet.detach()
      }
      if (this.dynamicSheet) this.dynamicSheet.detach()
    }

    getJss() {
      return this.context.jss || jss
    }

    render() {
      const sheet = this.dynamicSheet || this.staticSheet
      return <InnerComponent sheet={sheet} classes={sheet.classes} {...this.props} />
    }
  }
}
