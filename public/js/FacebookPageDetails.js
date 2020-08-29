import LoadableComponent from './LoadableComponent.js'

class FacebookPageDetails extends LoadableComponent {
  constructor () {
    super()

    this.loadedContent = document.createElement('p')

    this.setLoading()

    const auth = firebase.auth()
    const firestore = firebase.firestore()

    let unsubscribeUserSubscription
    auth.onAuthStateChanged(user => {
      if (!user || !user.uid) {
        if (unsubscribeUserSubscription) unsubscribeUserSubscription()
        this.loadedContent.innerHTML = ''
        return this.setLoaded()
      }

      this.setLoading()

      unsubscribeUserSubscription = firestore.collection('users').doc(user.uid)
        .onSnapshot(async doc => {
          const userData = doc.data()
          if (!userData) {
            this.loadedContent.innerHTML =
              'We have no data on you, please logout and login again.'
            return this.setLoaded()
          }

          const { pageAccessToken, pageID } = userData
          if (!pageAccessToken || !pageID) return this.setLoading()

          const url = `https://graph.facebook.com/v6.0/${pageID}?` +
            `fields=id,name,cover,picture&access_token=${pageAccessToken}`
          const response = await fetch(url)
          const json = await response.json()

          const eventListURL = window.location + 'v1.0/' + user.uid
          this.loadedContent.innerHTML = `
            The events from your page "${json.name}" are available at
            <a href="${eventListURL}">${eventListURL}</a>.
          `
          this.setLoaded()
        })
    })
  }
}

customElements.define('facebook-page-details', FacebookPageDetails)
