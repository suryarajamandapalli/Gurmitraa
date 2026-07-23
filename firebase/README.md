Realtime Database security rules and deployment notes

1) Purpose

Protect the `settings/master_password` entry so only authenticated admin users can read or modify it.

2) Files

- `firebase/database.rules.json` — Realtime Database rules for this project.

3) How to deploy

a) Add this to your `firebase.json` (project root) if not already present:

{
  "database": {
    "rules": "firebase/database.rules.json"
  }
}

b) Deploy rules with the Firebase CLI:

```bash
# login once
firebase login
# select project (or pass --project)
firebase use --add
# deploy database rules
firebase deploy --only database
```

4) How to mark a user as admin (custom claim)

Use the Firebase Admin SDK from a trusted environment (server or Cloud Function). Example (Node.js):

```js
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });

// Make sure you have the user's uid then:
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

Notes:
- Custom claims are stored in the user's ID token; clients must re-authenticate (or obtain a fresh token) to pick up updated claims.
- Admin SDK operations bypass Realtime Database rules, so your server-side code can continue to write protected paths securely.

5) Important recommendations

- Do NOT allow unauthenticated client code to write `settings/master_password`. Instead, perform passcode changes via a trusted server endpoint which uses the Admin SDK to update the database.
- Test your rules in the Firebase Console (Realtime Database -> Rules -> "Rules playground") before deploying.
- Consider moving the master passcode out of the database entirely and store it in your server env (or a secrets manager). If you keep it in the DB, ensure only admin principals can read it.

6) Rollback

If you need to revert rules, restore the previous `firebase/database.rules.json` and re-run `firebase deploy --only database`.
