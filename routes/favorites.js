const isLoggedIn = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");
const axios = require("axios");
const key = process.env.GOOGLE_API_KEY;
const Check = require("../models/CheckModel");
const router = require("express").Router();

async function enrichPlace(place_id) {
  const result = await Check.findOne({ place_id: place_id });
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
      decibels: "",
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
  return ({
    wheelchair_accessible,
    wheelchair_bathroom,
    braille_menu,
    braille_signs,
    large_menu,
    wheelchair_table,
    lights,
    comfortable_colors,
    noises,
    working_lift,
    decibels,
    sign_language,
    open_area,
    changing_ladies,
    changing_mens,
    high_chair,
    kids_menu,
    play_area,
    phone_charger,
    parking,
    strollers,
    breastfeeding,
  } = result);
}
/*
  map(favorites => axios.get( `https://maps.googleapis.com/maps/api/place/details/json?place_id=${favorite}&key=${key}`).then(({data}) =>{
    const {
      name,
      formatted_address,
      photos,
      international_phone_number,
      opening_hours,
      website,
    } = data.result;
    return enrichPlace(favorite).then(infos => ({
      name: name,
      address: formatted_address,
      photos: photos[0],
      phone: international_phone_number,
      opening_hours: opening_hours,
      website: website,
      infos: infos,
    }))
  } ))
  */
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
    };
  });
  Promise.all(favorites).then((results) => {
    res.json(results);
  });
});

router.post("/:id", isLoggedIn, (req, res, next) => {
  let favorites = req.user.favorites;
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
});

router.delete("/:id", isLoggedIn, (req, res, next) => {
  let favorites = req.user.favorites;
  const indexOf = favorites.indexOf(req.params.id);
  if (indexOf >= 0) {
    favorites.splice(indexOf, 1);
  }
  User.findByIdAndUpdate(req.user._id, {
    favorites: [...new Set(favorites)],
  }).then((result) => {
    res.json({ message: "your favorite place was deleted" });
  });
});

module.exports = router;
