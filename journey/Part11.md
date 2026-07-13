# Part 11 - Todo List

Now that the UI is mostly complete (still needs a good polish, but its functional) I need to tackle my todo list. Currently, I have the following remaining:

```
Backend:

- Rate Limiting
- Forgot password
- Too many wrong passwords
- Remember Me
- Admin Edit User Route
- Admin Get Users should also return how many forms each user has
- Super admin role for initial admin

Frontend:

- Remember Me
- pre-commit (lint, test, knip)
- Admin users page should show how many forms each user has

Overall:

- Production image build process
- Github actions update
```

So I've got to tackle these, at least, to be ready for a 1.0 release.

I'll start with Ratelimiting. For this, I think I will use a leaky bucket strategy. But some routes will need different protections. For instance, most routes I just need some sort of ratelimiting to prevent attacks, but for the most part I can set them to be something like 10 requests in a minute. None of my routes should get getting hit more than that at a time. However, there is one very public route that I need to severely limit, which is the route that accepts form submissions. If I allowed 10 submissions in a second from the same IP, it would be sending a lot of emails to the user and possibly cause issues with the SMTP provider to limit or ban us. For this, I want to make it really tight. I am thinking 2 requests per day. I can't think of ANY reason that on a simple site with a form (like a contact me form) needing a potential client to send more than 1 at a time, but if there is a little bit of an issue, 2 is a good fall back. 2 per day per IP. So I will create a new TokenBucket middleware to handle requests.

I used [this repo](https://github.com/psidh/Apex) as a guide on how I wanted to setup my rate limiting, then made some modifications to fit my use case. It took some figuring, but now the rate limiting works as expected. I can create 2 rate limiters and apply them to the routes as needed. Most routes use the 10 per second bucket, and the Submission route uses 2 per 24 hour bucket. I can create more buckets as needed, and tweak them easily as well. Perfect.

---

Next up is the "Forgot Password" issue. Since this is going to be a self-hosted application, I think I can go easy on this one. If a User forgets their password, the Admin can reset it for them and let them in, easy. But what if the Admin forgets their password? I need a secure way for them to get back in without re-deploying the app from fresh.

I have an idea that is simple, effective, and would be probably a bad idea if this was deployed in a major way, but my initial thought is to leverage the `ADMIN_PASS` variable the user sets when they are deploying their application. I can use this a failsafe to reset the admin password to something new, if they changed it and forgot what they changed it to.

So here is my plan. Since the Admin should have access to the logs of their deployment, if they pass the `ADMIN_PASS` to the route `/api/auth/forgot-password?admin_pass=${ADMIN_PASS}` and it matched, then I will change the password to a randomly generated new password and log this new password into the server logs. Nothing goes back to the Client. I could be cheeky about it to and always return the same 200 response, even if it doesn't work. Through this route behind a strict rate limiter, and boom. They can reset their password from anywhere provided they can access their logs. Simple, effective, and probably dumb as hell, but whatever. Chances are I will be the only person who ever uses this thing!

This does raise issues though with my current user setup. I have 2 roles, `admin` and `user`. What if the admin creates another admin? How do I differentiate? I think I need a further role of `super_admin` to keep track of the first and most important user. This would also allow this user to delete/edit other `admin` users, which isn't allowed at the moment.

Added the `super_admin` role and password reset works like a dream.

Time to work on the production image build process. I want this working so I can start pumping out new images more often as `0.x` releases. Helps test and then I can run it on my homelab as well for more testing.

Right now, it builds the backend perfectly, but I need it to also build the new frontend.

Shouldn't be too bad, I just need to run `bun build` on the react side, then load that into the image and point the route to that static bundle. I can use the same blog from `matteogassend` to set this up.

Took a bit more than I expected, but I got it working once I figured out how to tweak my dockerfile and make command (has to use AI to resolve some of the docker stuff I still need to learn) but now it builds. Time to commit, push, and release `v0.2`
