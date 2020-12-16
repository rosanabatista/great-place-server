const isLoggedIn = require("../middlewares/isLoggedIn");
const enrichPlace = require("../utils/enrichPlaces");
const getPhotos = require("../utils/getPhotos");
const router = require("express").Router();

const key = process.env.GOOGLE_API_KEY;
const axios = require("axios");
const Place = require("../models/PlaceModel");
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
    if (filters !== undefined && filters !== "") {
      let query = [];
      if (search) {
        query.push({ name: new RegExp(search, "i") });
      }
      filters.split(",").forEach((filter) => {
        query.push({ [`infos.${filter}`]: true });
      });
      Place.find({ $or: query }).then((result) => {
        const results = result.map((item) => {
          return Object.assign(
            { isFavorite: req.user.favorites.includes(item.place_id) },
            item._doc
          );
        });
        res.json(results);
      });
    } else {
      let endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${search}&type=restaurant&key=${key}`;

      if (latitude !== undefined && longitude !== undefined) {
        endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&type=restaurant&keyword=${search}&radius=50000&key=${key}`;
      }
      const { data } = await axios.get(endpoint);
      const returnedData = data.results.map(async (item) => {
        const {
          name,
          place_id,
          icon,
          formatted_address,
          vicinity,
          international_phone_number,
          website,
          photos,
        } = item;

        let picture;
        const infos = await enrichPlace(place_id);
        if (photos) {
          picture = await getPhotos(photos[0].photo_reference);
        }

        return {
          name: name,
          icon: icon,
          place_id: place_id,
          address: formatted_address,
          vicinity: vicinity,
          phone: international_phone_number,
          website: website,
          infos: infos,
          isFavorite: req.user.favorites.includes(place_id),
          picture: picture,
        };
      });
      Promise.all(returnedData).then((results) => {
        res.json(results.filter((item) => item !== undefined));
      });
    }
  } catch (err) {
    next(err);
  }
});

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
      website,
      place_id,
      photos,
    } = data.result;

    const infos = await enrichPlace(id);
    const picture = await getPhotos(photos[0].photo_reference);

    const comments = await Comment.find({ place_id: id }).populate("author");

    res.json({
      name: name,
      icon: icon,
      address: formatted_address,
      phone: international_phone_number,
      website: website,
      infos: infos,
      comments: comments,
      place_id: place_id,
      isFavorite: req.user.favorites.includes(place_id),
      picture: picture,
    });
  } catch (err) {
    next(err);
  }
});

//add infos to the place
router.post("/:id", isLoggedIn, async (req, res, next) => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.params.id}&key=${key}`
  );

  const {
    name,
    icon,
    formatted_address,
    international_phone_number,
    website,
    photos,
  } = data.result;
  const picture = await getPhotos(photos[0].photo_reference);

  Place.findOne({ place_id: req.params.id })
    .then((result) => {
      const payload = {
        place_id: req.params.id,
        infos: req.body,
        name,
        icon,
        address: formatted_address,
        international_phone_number,
        website,
        picture,
      };

      //if there is no info about this place
      if (!result) {
        Place.create(payload);
        res.json({ message: "you created new infos" });
      } else {
        Place.findOneAndUpdate({ place_id: req.params.id }, payload)
          .then((result) => {
            res.json({ message: "you updated new infos" });
          })
          .catch((err) => {
            res.json(err);
          });
      }
    })
    .catch((err) => {
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
      res.json({
        message: "comment added",
        comment: newComment.populate("author"),
      });
    });
  }
);

// router.get("/photos/:id", async (req, res, next) => {
//   const result = await axios.get(
//     `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${req.params.id}&key=${key}`
//   );
//   console.log(result.request.getHeader("Content-Type"));
//   res.send(result.data);
// });

module.exports = router;
