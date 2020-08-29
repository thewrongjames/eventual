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

Emulating locally:

```bash
firebase emulators:start
```

Before running the emulators you may want to run the following command in the
functions directory in order to copy down the configuration that is expected to
hold the facebook app credentials (file should be gitignored).

```bash
firebase functions:config:get > .runtimeconfig.json
```

Deploying:

```bash
firebase deploy
```

In both cases `--only hosting`, `--only functions`, or `--only firestore` should
be able to be used to filter down to only a particular part, but things might
get complicated because the hosting remaps the http functions to turn up at a
certain point, so, who knows.