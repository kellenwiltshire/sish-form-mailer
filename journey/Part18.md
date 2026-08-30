# Part 18 - 1.0 Release

Well, I've had to fix a couple small issues, and am currently working through some small UI tweaks. Going to give a good refactor look, but I think it is about time for the big 1.0 Release.

I thought it might be good for this last "post" to talk a bit about what I learned, what I might have done differently, and see how far I strayed from my 1st post goals.

## What I've learned

Obviously the big one here is that I know have a pretty good handle on `Go`. I feel confident working in it, I understand the basic syntax and how things work. I'd say I feel like I could easily find my way if a `Go` opportunity came up. Plus, I really, REALLY, like it. Resisting the urge to re-write everything in `Go`...

I've also learned a bit more about the DevOps side of things with Docker, DockerHub, and CI/CD. Definitely going to lean a lot into properly dockerizing applications going forward, not the half-assed way I had attempted it before.

Finally I feel a lot more confident around SQL. It had been a while since I really had to design a new database, but it was kinda fun. Yes, AI did help here, but I knew how I wanted it to be done, it just helped fill in some syntax.

## What I'd do differently

To be honest, I built this a lot how I wanted and expected. I knew I would run into issues along the way, and have to make some changes to my initial design, but that was expected. I probably could have spent more time working on the UI to make it more appealing, but I really just wanted to go for simple. There was a part when I was considering making this entirely an API driving project, with no UI at all, but I thought that would be harder for people to wrap their head around. Really, it could still function that way if you wanted.

One thing that made this drag on though is that I picked a very busy period in my life to start a project. This took months when it should have taken a couple weeks at most. Oh well, that's life.

## What changed from Part 1

Looking back at my System Design from Part 1, I think I got most of what I had hoped for. I hit all my Frontend and Backend functional requirements, with a slight tweak on how authentication is handled.

I didn't end up implementing a retry strategy for emails that failed to send, but I hope to in the future. There is also nothing stopping emails from continuing to be tried when new submissions come through if the previous failed to send, but that's okay too I think. Stuff to work on as I continue to build on this.

My tech stack changed, I went with Vite instead of NextJS for the frontend, seemed lighter. I also didn't implement a Queue system but used Postgres' built in Notify. Overall, I think I accomplished what I set out to do.

## Conclusion

In conclusion, I think I did what I wanted. I built a brand new app from scratch and used AI sparingly. I didn't use no AI though, but the times I did use it, it was a last resort. Sometimes I would come across issues where I just couldn't find up-to-date solutions, or my issue was novel.

AI was a big help though when it came to writing the ReadME and API documentation, as well as generating a simple Logo. It helped with some Postgres syntax and a couple small Dockerfile issues. 90+% of the code was written by me though, and that is what I wanted. I wanted to learn Go, improve my backend knowledge, improve SQL knowledge, improve Docker knowledge, and generally improve as a developer, and I think I did that.

I am very happy with the results!
