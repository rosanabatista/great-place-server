const axios = require("axios");
const key = process.env.GOOGLE_API_KEY;

async function getPhotos(photo_reference) {
  const result = await axios.get(
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photo_reference}&key=${key}`
  );

  return `${result.request.protocol}//${result.request.host}${result.request.path}`;
}

module.exports = getPhotos;
