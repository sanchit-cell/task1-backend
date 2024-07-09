const express = require("express");
const passport = require("passport");
const axios = require("axios");
const router = express.Router();

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: [
      "public_profile",
      "email",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_show_list",
    ],
  })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "https://task1-w74l.onrender.com/",
  }),
  (req, res) => {
    res.redirect("https://task1-w74l.onrender.com/");
  }
);

router.get("/api/current_user", (req, res) => {
  res.send(req.user);
});

router.get("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("https://task1-w74l.onrender.com/");
  });
});

router.get("/api/pages", async (req, res) => {
  if (!req.user || !req.user.accessToken) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/me/accounts?access_token=${req.user.accessToken}`
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching pages");
    console.log("'Error fetching pages");
  }
});

router.get("/test-session", (req, res) => {
  req.session.test = "test value";
  res.send("Session set");
});

router.get("/get-session", (req, res) => {
  res.send(req.session.test);
});

async function getPageAccessToken(pageId, userAccessToken) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${pageId}?fields=access_token&access_token=${userAccessToken}`
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to fetch Facebook page access token");
  }
}

router.get("/api/page-insights/:pageId", async (req, res) => {
  if (!req.user || !req.user.accessToken) {
    return res.status(401).send("Unauthorized");
  }

  const { pageId } = req.params;
  const { since, until } = req.query;
  const userAccessToken = req.user.accessToken;

  try {
    const pageAccessToken = await getPageAccessToken(pageId, userAccessToken);

    const response = await axios.get(
      `https://graph.facebook.com/${pageId}/insights?metric=page_follows,page_post_engagements,page_impressions,post_reactions_like_total&since=${since}&until=${until}&period=day&access_token=${pageAccessToken}`
    );
    console.log(`insights json data : ${response.data}`);

    if (response.data && response.data.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res.status(200).json({
        message: "No insights data available for the specified period",
        data: response.data.data,
      });
    }
  } catch (error) {
    console.error("Error fetching Facebook page insights:", error.message);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request data:", error.request);
    }

    // Sending an appropriate error response to the client
    res.status(500).json({
      message: "Failed to fetch Facebook page insights",
      error: error.message,
      ...(error.response && { details: error.response.data }),
    });
  }
});

module.exports = router;
