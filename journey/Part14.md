# Part 14 - Remaining Todo's

The todo list is getting pretty small, so I think I will conquer the rest of them in this PR. Here's what is left:

```
Backend:

Frontend:

- pre-commit (lint, test, knip)
- Admin users page should show how many forms each user has

Overall:

- Github actions update
```

Let's start with the Admin users page showing number of forms, seems like an easy start. Update the `User` type and add the column to the table. Pretty easy. Later on I would also like to add a columns to show how many responses the user is getting, but that's a later enhancement.

Moving on, I would like to get some pre-commit stuff going for the Frontend, mostly `lint`, `format`, and `knip` for now, since I haven't wrote any tests yet (whoops). Tests will be later though!

I need to see if something like `husky` works when not at the top level of a repo.
