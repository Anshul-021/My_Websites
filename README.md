# Anshul's Weather Machine!

A responsive weather app with current conditions, animated weather scenes, city imagery, practical tips, and a three-day forecast.

## Deploy the app with live weather

The page and the secure WeatherAPI proxy are designed to run together on Vercel. GitHub Pages can host the static page, but it cannot run the server-side function in `api/weather.js`.

1. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import the GitHub repository **Anshul-021/My_Websites**. Keep the project root at the repository root; no build command is needed.
3. In the project settings, open **Environment Variables** and add:
   - **Name:** `WEATHERAPI_KEY`
   - **Value:** your WeatherAPI key
   - **Environment:** Production (and Preview if you want preview links to work)
4. Save the setting, then redeploy the project so the function can read it.
5. Share the Vercel deployment URL. Weather searches on that site go through `/api/weather`; the key stays on the server.

Do not put the real key in `index.html`, commit it to GitHub, or send it in chat. Environment variables are managed outside the source code. If a key was ever committed to a public repository, rotate it with WeatherAPI.

The GitHub Pages address remains a static copy and will direct visitors to the Vercel version for live weather.
