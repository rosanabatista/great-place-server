const isLoggedIn = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");
const axios = require("axios");
const key = process.env.GOOGLE_API_KEY;
const Place = require("../models/PlaceModel");
const router = require("express").Router();

async function enrichPlace(place_id) {
  const result = await Place.findOne({ place_id: place_id });
  if (!result) {
    return {
      wheelchair_accessible: false,
      wheelchair_bathroom: false,
      braille_menu: false,
      braille_signs: false,
      large_menu: false,
      wheelchair_table: false,
      lights: false,
      comfortable_colors: false,
      noises: false,
      working_lift: false,
      sign_language: false,
      open_area: false,
      changing_ladies: false,
      changing_mens: false,
      high_chair: false,
      kids_menu: false,
      play_area: false,
      phone_charger: false,
      parking: false,
      strollers: false,
      breastfeeding: false,
    };
  }
  return result.infos;
}

router.get("/", isLoggedIn, async (req, res, next) => {
  const favorites = req.user.favorites.map(async (favorite) => {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${favorite}&key=${key}`
    );
    const {
      place_id,
      name,
      formatted_address,
      international_phone_number,
      website,
    } = data.result;

    const infos = await enrichPlace(favorite);

    return {
      name: name,
      place_id: place_id,
      address: formatted_address,
      phone: international_phone_number,
      website: website,
      infos: infos,
      isFavorite: true,
    };
  });
  Promise.all(favorites).then((results) => {
    res.json(results);
  });
});

router.post("/:id", isLoggedIn, (req, res, next) => {
  let favorites = req.user.favorites;
  if (favorites.includes(req.params.id)) {
    const indexOf = favorites.indexOf(req.params.id);
    if (indexOf >= 0) {
      favorites.splice(indexOf, 1);
    }
    User.findByIdAndUpdate(req.user._id, {
      favorites: [...new Set(favorites)],
    }).then((result) => {
      res.json({ message: "your favorite place was deleted" });
    });
  } else {
    if (favorites.length < 5) {
      favorites.push(req.params.id);
      User.findByIdAndUpdate(req.user._id, {
        favorites: [...new Set(favorites)],
      }).then((result) => {
        res.json({ message: "your favorite place was added" });
      });
    } else {
      res.json({ message: "you can only add a maximum of 5 favorites" });
    }
  }
});

module.exports = router;
