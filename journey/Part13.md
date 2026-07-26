# Part 13 - Continuing Todo's

Time to really drop this Todo list down. I want to get this project done!

Here's what's left:

```
Backend:

- Admin Edit User Route
- Admin Get Users should also return how many forms each user has
- HTML Template for Submission emails to user

Frontend:

- pre-commit (lint, test, knip)
- Admin users page should show how many forms each user has

Overall:

- Github actions update
```

Let's finish up the backend todo's. First up is editing a user. Simple enough, just need to create a new update handler that takes the user ID from the param instead of the cookie. I also had to put in some security checks to make sure users have the correct editing permissions. I'll likely need to break this out to its own check at some point. `Super` should be able to modify/delete any user (only ever 1 `Super`). `Admin` can only modify regular users, and can't modify `Super` or other `Admin`. `User` can't modify anyone.

Getting the number of forms for each user is a little more tricky. Will need to iterate through the Users array found and pass that into a new function in the `forms_store` to return the count for each user. Not super hard, but will require a bit of work to combine the data into a new object back into the array.

Now, the last backend todo is to make a nice template email containing the form responses. The hard part of this is that outside of the name and time the response was received, the actual payload of the response is different for every form. So I need to iterate over the payload object and display each input nicely. I'll have to write out some html by hand for this, and even some css too since I don't think I can include a script for Tailwind in an email template.

This took some configuring, the email template was easy enough to build, but I did get a little help from AI to quickly generate something close to what I want. There was also some issues I ran into getting it setup with the `go` smtp mailer, but it all works now and looks fairly decent. Well enough for v1 anyways.

Going to call it here, Backend todos are done. Frontend next!
