const router = require("express").Router();
const authRoutes = require("./auth");
const placesRoutes = require("./places");
const favoritesRoutes = require("./favorites");
/* GET home page */
router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use("/auth", authRoutes);

router.use("/places", placesRoutes);

router.use("/favorites", favoritesRoutes);

module.exports = router;
