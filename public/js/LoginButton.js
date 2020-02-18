import LoadableComponent from './LoadableComponent.js'

class LoginButton extends LoadableComponent {
  constructor () {
    super()

    this.loadedContent = document.createElement('div')
    this.textElement = document.createElement('p')
    this.loadedContent.appendChild(this.textElement)
    this.loginButton = document.createElement('button')
    this.loadedContent.appendChild(this.loginButton)

    this.setLoading()

    const loginHandler = async () => {
      this.setLoading()
      const authProvider = new firebase.auth.FacebookAuthProvider()
      authProvider.addScope('manage_pages')
      const loginResult = await firebase.auth().signInWithPopup(authProvider)
      return firebase.firestore()
        .collection('users').doc(loginResult.user.uid).set({
          uid: loginResult.user.uid,
          displayName: loginResult.user.displayName,
          accessToken: loginResult.credential.accessToken
        })
    }
    const logoutHandler = () => {
      this.setLoading()
      return firebase.auth().signOut()
    }

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.loginButton.removeEventListener('click', loginHandler)
        this.loginButton.addEventListener('click', logoutHandler)
        this.textElement.innerText = `Logged in as ${user.displayName}`
        this.loginButton.innerText = 'Logout'
      } else {
        this.loginButton.removeEventListener('click', logoutHandler)
        this.loginButton.addEventListener('click', loginHandler)
        this.textElement.innerText = 'Not logged in'
        this.loginButton.innerText = 'Login'
      }
      this.setLoaded()
    })
  }
}

customElements.define('login-button', LoginButton)
