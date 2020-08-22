# Eventual

Some kind of facebook page event accessor management or something.

## Application Design

The application is designed to be hosted through firebase. It consists of a
currently incredibly bare-bones (to the point of not having any css at all)
web-component page that allows users to log in to give it access to the facebook
page they want to share the events from, and then a bunch of firebase functions
written in typescript that handle getting the required tokens for these users
and the routes that users can go to for JSON once they have logged in.

## Repo Commands

These will require the `firebase-tools` package from npm to be installed
globally.

Serving locally:

```bash
firebase serve
```

Deploying:

```bash
firebase deploy
```

In both cases `--only hosting` or `--only functions` should be able to be used
to filter down to only a particular part, but things might get complicated
because the hosting remaps the http functions to turn up at a certain point, so,
who knows.