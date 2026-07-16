# Part 12 - Rename & Todo's

So I need to rename the project from `Formality` because it is too similar to other Form projects out there. I also think this kind of app, where it is just simple bare bones service, may be something I try to create more of, so I've come up with a new name.

## Simple Self Hosted - Form Mailer

Now, that is a mouthful, obviously, so for the repo's it's going to be shorted to `SiSH - Form Mailer`

So renaming this project isn't too bad, can almost do a find and replace on it. Then rename the Github Repo, point this local to the new origin. Finally update to a new Dockerhub repo and that's it.

Back to the Todo list.

Here's what is left:

```
Backend:

- Remember Me
- Too many wrong passwords
- Admin Edit User Route
- Admin Get Users should also return how many forms each user has
- HTML Template for Submission emails to user

Frontend:

- Remember Me
- pre-commit (lint, test, knip)
- Admin users page should show how many forms each user has

Overall:

- Github actions update

```

Still a bit to do... Let's start with an easy one, `Remember Me`. This is super simple, when a user logs in, they can check a checkbox to remember them, this will increase the cookie TTL from 24 hours to 30 days. Simple. Frontend sends the boolean, backend checks the boolean and updates the token. 2 files changed, done!

Next up, `Too many wrong passwords`. This one is a little trickier, I'd like to lock a user out for a certain amount of time if they get their password wrong too many times in a row. I'm thinking if they enter it wrong 3 times in a row, within a 1 hour window, then we lock them out for 1 day. I think I can use the same kind of logic as the auth token system. I can create a `table` with the following columns: `email, num_attempts, expiry`. When an incorrect email and password combo is entered, we create a new row in the DB with that `email`, set the `num_attempts` to `1`, and the `expiry` to 1 hour. If they get it wrong again, we increment `num_attempts` to `2`. If they get it wrong another time in that hour, then we increment `num_attempts` 1 final time to `3` and update the `expiry` to be 24 hours from now.

On each each sign-in attempt, we need to check this DB first. If they user's email is in there, not expired, and attempts at 3, we just return locked out. Once the the row is expired, we return to the normal flow. Just gotta create another store for this to be handled by.

Easy peazy. Enough for now. Time to PR and build!
