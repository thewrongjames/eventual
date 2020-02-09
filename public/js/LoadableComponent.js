/**
 * A component that may render as a loading bar. This class is designed to be
 * extended, it is abstract. It assumes this.loadedContent will be defined if
 * anything other than a loading bar is to be rendered, and it creates and
 * attaches a shadow DOM at this.shadow.
 */
export default class LoadableComponent extends HTMLElement {
  constructor () {
    super()

    if (new.target === LoadableComponent) {
      throw new TypeError(
        'LoadableComponent is abstract and cannot be directly constructed'
      )
    }

    this.shadow = this.attachShadow({ mode: 'open' })
    this.loadingBar = document.createElement('progress')
  }

  setLoading () {
    try { this.shadow.removeChild(this.loadedContent) } catch {}
    this.shadow.appendChild(this.loadingBar)
  }

  setLoaded () {
    try { this.shadow.removeChild(this.loadingBar) } catch {}
    try { this.shadow.appendChild(this.loadedContent) } catch {}
  }
}
