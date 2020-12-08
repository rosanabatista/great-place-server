const isLoggedIn = require("../middlewares/isLoggedIn");

const router = require("express").Router();

router.get("/", isLoggedIn, (req, res, next) => {
  res.json([]);
});

router.post("/", isLoggedIn, (req, res, next) => {
  res.json({ message: "your favorite place was added" });
});

router.delete("/:id", isLoggedIn, (req, res, next) => {
  res.json({ message: "your favorite place was deleted" });
});

module.exports = router;
