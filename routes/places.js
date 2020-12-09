const isLoggedIn = require("../middlewares/isLoggedIn");

const router = require("express").Router();

const key = process.env.GOOGLE_API_KEY;
const axios = require("axios");
const Check = require("../models/CheckModel");

//search the places
router.get("/search", isLoggedIn, async (req, res, next) => {
  try {
    const query = req.query.search;

    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`
    );
    console.log(data);
    const returnedData = data.results.map(async (item) => {
      const {
        name,
        formatted_address,
        photos,
        international_phone_number,
        opening_hours,
        website,
      } = item;

      const infos = await enrichPlace(item.place_id);

      return {
        name: name,
        address: formatted_address,
        photos: photos[0],
        phone: international_phone_number,
        opening_hours: opening_hours,
        website: website,
        infos: infos,
      };
    });
    Promise.all(returnedData).then((results) => {
      res.json(results);
    });
  } catch (err) {
    next(err);
  }
});

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

//get the single place
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id;

    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${key}`
    );

    const {
      name,
      formatted_address,
      photos,
      international_phone_number,
      opening_hours,
      website,
    } = data.result;

    const infos = await enrichPlace(req.params.id);

    res.json({
      name: name,
      address: formatted_address,
      photos: photos[0],
      phone: international_phone_number,
      opening_hours: opening_hours,
      website: website,
      infos: infos,
    });
  } catch (err) {
    next(err);
  }
});

//add infos to the place
router.post("/:id", isLoggedIn, (req, res, next) => {
  Check.findOne({ place_id: req.params.id })
    .then((result) => {
      //if there is no info about this place
      if (!result) {
        Check.create(Object.assign({ place_id: req.params.id }, req.body));
        res.json({ message: "you created new infos" });
      }
      Check.findOneAndUpdate({ place_id: req.params.id }, req.body)
        .then((result) => {
          res.json({ message: "you updated new infos" });
        })
        .catch((err) => {
          console.log("error");
          res.json(err);
        });
    })
    .catch((err) => {
      console.log("error");
      res.json(err);
    });
  //   res.json({ message: "you created new infos" });
});

//delete the infos from the place
router.delete("/:id", isLoggedIn, (req, res, next) => {
  res.json({ message: "you deleted infos" });
});

module.exports = router;
