import LoadableComponent from './LoadableComponent.js'

class UserManagement extends LoadableComponent {
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
      authProvider.addScope('pages_show_list')
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

        const deleteAllDataButton = document.createElement('button')
        deleteAllDataButton.innerText = 'Delete All Data'
        deleteAllDataButton.id = 'delete-all-data-button'
        deleteAllDataButton.addEventListener('click', () => {
          firebase.firestore().collection('users').doc(user.uid).delete()
        })
        this.loadedContent.appendChild(deleteAllDataButton)
      } else {
        const maybeDeleteAllDataButton = this.loadedContent.lastChild
        if (maybeDeleteAllDataButton.id === 'delete-all-data-button') {
          maybeDeleteAllDataButton.remove()
        }

        this.loginButton.removeEventListener('click', logoutHandler)
        this.loginButton.addEventListener('click', loginHandler)
        this.textElement.innerText = 'Not logged in'
        this.loginButton.innerText = 'Login'
      }
      this.setLoaded()
    })
  }
}

customElements.define('user-management', UserManagement)
