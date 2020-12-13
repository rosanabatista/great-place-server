const isLoggedIn = require("../middlewares/isLoggedIn");

const router = require("express").Router();

const key = process.env.GOOGLE_API_KEY;
const axios = require("axios");
const Check = require("../models/CheckModel");
const Comment = require("../models/Comment.model");

//cloudinary configuration
const multer = require("multer");
const cloudinary = require("cloudinary");
const multerStorageCloudinary = require("multer-storage-cloudinary");

const storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary.v2,
});

const upload = multer({ storage });

//search the places
router.get("/search", isLoggedIn, async (req, res, next) => {
  try {
    const { search, latitude, longitude, filters } = req.query;
    let endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${search}&key=${key}`;

    if (latitude !== undefined && longitude !== undefined) {
      endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&keyword=${search}&radius=10000&key=${key}`;
    }
    const { data } = await axios.get(endpoint);
    console.log(data);
    const returnedData = data.results.map(async (item) => {
      const {
        name,
        place_id,
        formatted_address,
        international_phone_number,
        opening_hours,
        website,
      } = item;

      const infos = await enrichPlace(place_id);
      console.log(infos);
      if (filters !== undefined && filters !== "") {
        console.log(Object.keys(infos));
        const available = Object.keys(infos).filter(
          (key) => infos[key] === true
        );
        console.log(available);
        if (!available.some((item) => filters.split(",").includes(item))) {
          return;
        }
      }

      return {
        name: name,
        place_id: place_id,
        address: formatted_address,
        phone: international_phone_number,
        opening_hours: opening_hours,
        website: website,
        infos: infos,
      };
    });
    Promise.all(returnedData).then((results) => {
      res.json(results.filter((item) => item !== undefined));
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
  return Object.assign({}, result._doc);
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
      icon,
      formatted_address,
      international_phone_number,
      opening_hours,
      website,
      place_id,
    } = data.result;

    const infos = await enrichPlace(id);

    const comments = await Comment.find({ place_id: id }).populate("author");

    res.json({
      name: name,
      icon: icon,
      address: formatted_address,
      phone: international_phone_number,
      opening_hours: opening_hours,
      website: website,
      infos: infos,
      comments: comments,
      place_id: place_id,
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
      } else {
        Check.findOneAndUpdate({ place_id: req.params.id }, req.body)
          .then((result) => {
            res.json({ message: "you updated new infos" });
          })
          .catch((err) => {
            console.log("error");
            res.json(err);
          });
      }
    })
    .catch((err) => {
      console.log("error");
      res.json(err);
    });
});

// add comments
router.post(
  "/:id/new-comment",
  isLoggedIn,
  upload.single("picture"),
  (req, res, next) => {
    const { body } = req.body;
    const file = req.file;
    let path = null;
    if (file) {
      path = file.path;
    }
    Comment.create({
      body,
      place_id: req.params.id,
      author: req.user._id,
      picture: path,
    }).then((newComment) => {
      res.json({ message: "comment added", comment: newComment });
    });
  }
);

module.exports = router;
