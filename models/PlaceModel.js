const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
  name: String,
  icon: String,
  address: String,
  phone: String,
  website: String,
  infos: {
    wheelchair_accessible: {
      type: Boolean,
      default: false,
    },
    wheelchair_bathroom: {
      type: Boolean,
      default: false,
    },
    braille_menu: {
      type: Boolean,
      default: false,
    },
    braille_signs: {
      type: Boolean,
      default: false,
    },
    large_menu: {
      type: Boolean,
      default: false,
    },
    wheelchair_table: {
      type: Boolean,
      default: false,
    },
    lights: {
      type: Boolean,
      default: false,
    },
    comfortable_colors: {
      type: Boolean,
      default: false,
    },
    noises: {
      type: Boolean,
      default: false,
    },
    working_lift: {
      type: Boolean,
      default: false,
    },
    sign_language: {
      type: Boolean,
      default: false,
    },
    open_area: {
      type: Boolean,
      default: false,
    },
    changing_ladies: {
      type: Boolean,
      default: false,
    },
    changing_mens: {
      type: Boolean,
      default: false,
    },
    high_chair: {
      type: Boolean,
      default: false,
    },
    kids_menu: {
      type: Boolean,
      default: false,
    },
    play_area: {
      type: Boolean,
      default: false,
    },
    phone_charger: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    strollers: {
      type: Boolean,
      default: false,
    },
    breastfeeding: {
      type: Boolean,
      default: false,
    },
  },
  place_id: String,
});

const Place = mongoose.model("Place", PlaceSchema);
module.exports = Place;
