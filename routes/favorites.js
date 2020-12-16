const isLoggedIn = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");
const axios = require("axios");
const key = process.env.GOOGLE_API_KEY;
const Place = require("../models/PlaceModel");
const router = require("express").Router();
const enrichPlace = require("../utils/enrichPlaces");
const getPhotos = require("../utils/getPhotos");

router.get("/", isLoggedIn, async (req, res, next) => {
  const favorites = req.user.favorites.map(async (favorite) => {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${favorite}&key=${key}`
    );
    const {
      place_id,
      name,
      icon,
      formatted_address,
      international_phone_number,
      website,
      photos,
    } = data.result;

    const infos = await enrichPlace(favorite);
    let picture;
    if (photos) {
      picture = await getPhotos(photos[0].photo_reference);
    }

    return {
      name: name,
      place_id: place_id,
      icon: icon,
      address: formatted_address,
      phone: international_phone_number,
      website: website,
      infos: infos,
      isFavorite: true,
      picture,
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
