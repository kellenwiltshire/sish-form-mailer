# Part 16 - Post-Alpha Release

Alpha release is now living on my server, but it isn't really functional. It took a couple tries to get things setup properly, but I can't login. The reason, of course, is CORS. Because of how my server is setup, the application UI is being served at `192.168.x.xxx:8082` and the `POST` requests are being sent to `localhost:8080/api/auth/login` since that is the path within the containers. This would have also been an issue, I believe, when a user would try to submit a form response. I need to allow cross origin, but I need to do it in a safe way.

I need to allow the user to designate safe origins that the app will allow. The first would be an environment variable, then the rest would be stored in a table that could be updated as required. A table may really be overkill, but it'll work for now. This will delay the Beta Release while I work out some of the Alpha problems. I really want the Beta release to be mostly functional, with just some minor UI bugs to fix.

For the CORS issue, I've added in `go-chi/cors` and setup a CORS handler. Now every request has the origin checked against the list of allowed origins. If it is in the DB, then it gets passed, otherwise rejected.

I've created a new table for this, and I'll have to update the UI as well to make sure that Users can add allowed origins for their forms to receive responses. I'm also use `go-cache` to make sure that DB isn't hit on every singe request. I did need some help from AI on this part, but at this point I want this project done.

The UI update for this will be pretty much a copy/paste of the Admin stuff with small tweaks, to keep it simple. User can only add/view/delete their origins.

Now I can also work on fixing some weird UI issues, adding the logo, and get things a little more ironed out for a Beta release. I'd also like to do some general refactoring. Before the prod release too I need to work on some documentation, but I may let the `clanker` handle that.

Aside from the pending Documentation, I think this is looking pretty close to done, at least for a beta release and I can start to hook up some of the client forms I have to use it, even just as a backup for a bit of testing. Then I can have some real world data to work with and see whats going on.

Before I do that though, I need to setup ReCaptcha on the server side for verification. This will be a couple `.env` variables that will determine if the User is using recatpcha, and then if the recaptcha passes.

Some things to consider:

- How the flow should look for recatpcha
- How to handle successful challenges
- How to handle unsuccessful challenges

For the flow, I believe the server should receive the submission -> process recatpcha -> depending on success set a value in a new column -> depending on that value we send the email.

For successful recatpcha, the flow will look very similar to now. The biggest thing I want to try and mitigate here is slowing down the experience on the client side. May have to come up with some interesting new things here.

For the unsuccessful challenges, I don't want to send these through to the User by email, but I do want to track the submissions in case of a false positive. I can still show these submissions in the UI, maybe hidden, with an indicator that the submission failed recatpcha.

Let's get building. First I will modify the tables, then add in a new service to handle actually checking the recaptcha, then update everywhere else, then test it all, best I can.
