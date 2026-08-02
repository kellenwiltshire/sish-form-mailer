# Part 15 - Alpha Release

Okay, the plan is now is to do a FRESH run through of all the features and capabilities. Starting with a fully fresh DB. Here's what needs to be functional:

- Application starts and UI loads
- Super Admin login functions
- Super Admin can create a form
- Super Admin can add SMTP settings
- Super Admin form can receive a response
- Super Admin form response is emailed as expected
- Super Admin can delete response
- Super Admin can create Admin
- Super Admin can edit Admin
- Admin login functions
- Admin can create a form
- Admin can add SMTP settings
- Admin form can receive a response
- Admin form response is emailed as expected
- Admin can delete response
- Admin can create user
- Admin can edit user
- User login functions
- User can create a form
- User can add SMTP settings
- User form can receive a response
- User form response is emailed as expected
- User can delete response
- User can delete form
- Admin can delete User
- Super Admin can Delete Admin

I think if all this functions, it will be good enough for an Alpha release. It doesn't need to be bug free, but this is good to start towards a proper v1.0.

Time to get cracking.

- Application starts and UI loads ✅
- Super Admin login functions ✅
- Super Admin can create a form ✅
- Super Admin can add SMTP settings ❌

First bug. The form is not functional on the UI. This should be a straight forward fix though. Seems to be all the inputs not working. Back on track!

- Super Admin can add SMTP settings ✅
- Super Admin form can receive a response ✅
- Super Admin form response is emailed as expected ❌

Another bug, around authentication. There must be some issues around how the password is being hashed and retrieved. Will log this for future fixing.

- Super Admin can delete response ✅
- Super Admin can create Admin ✅
- Super Admin can edit Admin ❌

Super Admin can't edit the admin. Weird. The cause seems to be how I check in the UI for how to edit a user. I'll log this for future review too.

- Admin login functions ✅
- Admin can create a form ✅
- Admin can add SMTP settings ✅
- Admin form can receive a response ✅
- Admin form response is emailed as expected ❌
- Admin can delete response ✅
- Admin can create user ✅
- Admin can edit user ✅ - Admin can also edit Super Admin, this is a bug.
- User login functions ✅
- User can create a form ✅
- User can add SMTP settings ✅
- User form can receive a response ✅
- User form response is emailed as expected ❌
- User can delete response ✅
- User can delete form ✅ - Throws a bug in the UI, no `null` check on form table.
- Admin can delete User ✅
- Super Admin can Delete Admin ✅

So most things work, here are the bugs:

- SMTP Settings are causing authentication errors with trying to send emails
- Super Admin can't edit the admin, need more permission checks on the UI side to match the checks on the backend
- No `null` or `undefined` checks when trying to perform actions around the UI
- When a users session expires, it doesn't direct them back to the login page
- Missing SMTP email settings test from the UI side

Not too bad, the real big one is the SMTP stuff. Have to figure out where the issue is. I think it is around the password part of things. Should be easy to sus out.

Turns out it was user error, not a bug. Used the wrong smtp password. So, things look okay there now. I'll run though more tests again later.

Next up, changing UI admin permissions. Just adding a simple downward check to make sure that the current user role can only edit roles beneath them does the trick.

The next toughest bug would be the checking of user sessions. Since I am using an `httpOnly` cookie, I can't check its status from the client. So I need to be able to query an endpoint for its status. I can query the `api/user` endpoint though, which would only return data if the user is logged in, so that works. React Router has built in functionality to help with this too, nice and clean.

Last 2 bugs are mostly just UI things, can clean them up fast and then I am ready for v1.0 alpha I think! Next up, Beta. I am sure that Beta release will highlight more errors, especially UI errors, but for now I think this is good to get an Alpha loaded on my server to start some preliminary testing.
