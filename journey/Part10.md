# Part 10 - Frontend

I think it is time to start building the frontend. There are a few things left on the backend to complete, but the frontend shouldn't take long and will make things easier to test.

I am going to use `vite` to create a React frontend, and `bun` as my runtime. This should be fast and performant.

Should be as easy as running `bun create vite client` to create the react app in a new directory `client`

I don't really see the need to create a lot of "pages" for the user. Really, just a couple:

- "/" - Will be the login page
- "/dashboard" - Will be the main "home" page for the user

On the `dashboard` we can have a side menu that allows the user to navigate between different views.

Views:

- Forms - Shows all the users forms they have access to
- - Clicking on a form opens the form view which shows responses and allows user to edit the form
- Email Settings - Allows the user to add/update their smtp settings
- Settings - Allows the user to update their information (email, password)
- Admin - available to admins only, allows admins to add/delete users

I am going to use `TailwindCSS` for styling. It is easy to move quick with and I have access to their UI components through their `TailwindPlus` service. I don't need to spend more time than necessary building UI, I know that already.

I am going to need to install `react-router-dom` to handle the routing within the `client` as well.

With some fanagaling, I was able to get the React app working with docker and having the `Go` app work as a proxy for request. So I should be able to make changes, and work with the API all at once. Little docker networking configuration, and a very helpful blog from `matteogassend` got me there.

From here on it'll just be building the UI, so I am going to commit this, then work away. Part 11 may be a bit of a "jump" in terms of what I am working on since building the UI should be pretty straightforward with only little hurdles and tweaks.
