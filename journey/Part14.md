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

I was able to get `husky` working while not at the top level of a repo, so that was a big help. Now at least I know the Client side of things will be properly formatted and linted, something it looks like Go takes care of on its own, which is great. I also made sure to run the default `make` command as well, which builds and runs the image, but that's overkill. I've updated it to just make sure that the `go` builds correctly.

Last up from the Todo list is updating github actions. I want to make sure that PR's build, are linted, formatted, and cleaned by knip. Pretty straight forward as well. That's the todo list!

Getting closer to an alpha release here. Next up will be to really go through the UI flow, find errors, bugs, or crashes and mitigate. Goal is for next PR to be an `alpha` release!
