import LoadableComponent from './LoadableComponent.js'

class FacebookPageDetails extends LoadableComponent {
  constructor () {
    super()

    const loadedContent = document.createElement('div')
    const description = document.createElement('p')
    description.innerText = 'The following page is '
    loadedContent.innerText = 'Hello world!'

    this.setLoading()

    const auth = firebase.auth()
    const firestore = firebase.firestore()

    let unsubscribeUserSubscription
    auth.onAuthStateChanged(user => {
      if (!user || !user.uid) {
        if (unsubscribeUserSubscription) unsubscribeUserSubscription()
        return this.setLoading()
      }

      unsubscribeUserSubscription = firestore.collection('users').doc(user.uid)
        .onSnapshot(async doc => {
          const { pageAccessToken, pageID } = doc.data()
          const url = `https://graph.facebook.com/v6.0/${pageID}?` +
            'fields=id,name,cover,picture,' +
            'events{cover,name,description,start_time,end_time,place}&' +
            `access_token=${pageAccessToken}`
          const json = await fetch(url).then(response => response.json())
          console.log(json)
        })
    })
  }
}

customElements.define('facebook-page-details', FacebookPageDetails)
