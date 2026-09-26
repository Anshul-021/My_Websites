module.exports = async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: { message: "Use a GET request." } });
  }

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: {
        message: "The weather service is not configured yet. Add WEATHERAPI_KEY in Vercel project settings, then redeploy."
      }
    });
  }

  const city = typeof req.query?.q === "string" ? req.query.q.trim() : "";
  if (!city || city.length > 120) {
    return res.status(400).json({
      error: { message: "Enter a city name (up to 120 characters)." }
    });
  }

  const upstreamUrl = new URL("https://api.weatherapi.com/v1/forecast.json");
  upstreamUrl.search = new URLSearchParams({
    key: apiKey,
    q: city,
    aqi: "no",
    days: "3"
  });

  try {
    const upstream = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(10000)
    });

    let data;
    try {
      data = await upstream.json();
    } catch {
      return res.status(502).json({
        error: { message: "The weather provider returned an unreadable response." }
      });
    }

    if (!upstream.ok) {
      const providerErrorCode = data?.error?.code;

      if (upstream.status === 400) {
        return res.status(404).json({
          error: { message: "City not found. Check the spelling and try again." }
        });
      }
      if (upstream.status === 401 || providerErrorCode === 1002 || providerErrorCode === 2006) {
        return res.status(502).json({
          error: { message: "WeatherAPI rejected the key. Replace the WEATHERAPI_KEY value in Vercel with your current WeatherAPI key, then redeploy." }
        });
      }
      if (upstream.status === 403 && providerErrorCode === 2007) {
        return res.status(503).json({
          error: { message: "The WeatherAPI monthly request quota has been reached. Check your WeatherAPI account." }
        });
      }
      if (upstream.status === 403 && providerErrorCode === 2008) {
        return res.status(503).json({
          error: { message: "This WeatherAPI key is disabled. Create or enable a key in your WeatherAPI account, then update Vercel and redeploy." }
        });
      }
      if (upstream.status === 403 && providerErrorCode === 2009) {
        return res.status(503).json({
          error: { message: "This WeatherAPI plan does not allow the requested forecast. Check the plan features in your WeatherAPI account." }
        });
      }
      if (upstream.status === 429) {
        return res.status(503).json({
          error: { message: "The weather service is busy. Please try again shortly." }
        });
      }
      return res.status(502).json({
        error: { message: "WeatherAPI is temporarily unavailable. Please try again shortly." }
      });
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({
      error: { message: "Could not reach the weather provider. Please try again." }
    });
  }
};
