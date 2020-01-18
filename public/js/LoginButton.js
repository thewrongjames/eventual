/* global HTMLElement:false customElements:false firebase:false */

// eslint-disable-next-line no-unused-vars
class LoginButton extends HTMLElement {
  constructor () {
    super()

    // Build internal element structure in a shadow DOM.
    const shadow = this.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    container.setAttribute('class', 'container')
    this.textSpan = document.createElement('span')
    this.textSpan.setAttribute('class', 'textSpan')
    container.appendChild(this.textSpan)
    this.loginButton = document.createElement('button')
    this.loginButton.setAttribute('class', 'loginButton')
    container.appendChild(this.loginButton)
    this.setLoading()

    const loginHandler = () => {
      this.setLoading()
      const facebookProvider = new firebase.auth.FacebookAuthProvider()
      facebookProvider.addScope('manage_pages')
      return firebase.auth().signInWithPopup(facebookProvider)
        .then(result => firebase.firestore()
          .collection('users').doc(result.user.uid).set({
            uid: result.user.uid,
            displayName: result.user.displayName,
            accessToken: result.credential.accessToken
          })
        )
        .catch(console.error)
    }
    const logoutHandler = () => {
      this.setLoading()
      return firebase.auth().signOut()
    }

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.loginButton.removeEventListener('click', loginHandler)
        this.loginButton.addEventListener('click', logoutHandler)
        this.textSpan.innerText = `Logged in as ${user.displayName}`
        this.loginButton.innerText = 'Logout'
      } else {
        this.loginButton.removeEventListener('click', logoutHandler)
        this.loginButton.addEventListener('click', loginHandler)
        this.textSpan.innerText = 'Not logged in'
        this.loginButton.innerText = 'Login'
      }
    })

    shadow.appendChild(container)
  }

  setLoading () {
    this.textSpan.innerText = 'Loading'
    this.loginButton.innerText = 'Don\'t press'
  }
}

customElements.define('login-button', LoginButton)
