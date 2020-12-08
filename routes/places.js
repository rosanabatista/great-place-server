const isLoggedIn = require("../middlewares/isLoggedIn");

const router = require("express").Router();

//search the places
router.get("/search", isLoggedIn, (req, res, next) => {
  res.json({ query: req.query.query });
});

//get the single place
router.get("/:id", isLoggedIn, (req, res, next) => {
  res.json({ id: req.params.id });
});

//add infos to the place
router.post("/:id", isLoggedIn, (req, res, next) => {
  res.json({ message: "you created new infos" });
});

//delete the infos from the place
router.delete("/:id", isLoggedIn, (req, res, next) => {
  res.json({ message: "you deleted infos" });
});

module.exports = router;
