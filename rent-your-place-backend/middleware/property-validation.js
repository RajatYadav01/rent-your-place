module.exports = async (request, response, next) => {
  const {
    id,
    country,
    place,
    totalArea,
    numberOfBedrooms,
    numberOfBathrooms,
    nearbyLandmark,
    ownerID,
  } = request.body;
  function isCountryValid(country) {
    return /^(?=.{2,})[A-Za-z\s\.\-]+$/.test(country);
  }

  function isPlaceValid(place) {
    return /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/.test(place);
  }

  function isTotalAreaValid(area) {
    return /^[1-9][0-9]*$/.test(area);
  }

  function isOwnerIDValid(id) {
    return /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(
      id
    );
  }

  if (request.path === "/api/properties/new") {
    if (
      ![
        country,
        place,
        totalArea,
        numberOfBedrooms,
        numberOfBathrooms,
        nearbyLandmark,
        ownerID,
      ].every(Boolean)
    )
      return response.status(403).json({ message: "Missing details" });
    else if (!isCountryValid(country))
      return response.status(403).json({ message: "Invalid country" });
    else if (!isPlaceValid(place))
      return response.status(403).json({ message: "Invalid place" });
    else if (!isTotalAreaValid(totalArea))
      return response.status(403).json({ message: "Invalid area" });
    else if (!isTotalAreaValid(numberOfBedrooms))
      return response
        .status(403)
        .json({ message: "Invalid number of bedrooms" });
    else if (!isTotalAreaValid(numberOfBathrooms))
      return response
        .status(403)
        .json({ message: "Invalid number of bathrooms" });
    else if (!isPlaceValid(nearbyLandmark))
      return response.status(403).json({ message: "Invalid nearby landmark" });
    else if (!isOwnerIDValid(ownerID.toString()))
      return response
        .status(401)
        .json({ message: "Not authorized to add property" });
  } else if (
    request.path === "/api/properties/update" ||
    request.path === "/api/properties/delete" ||
    request.path === "/api/properties/get-owner"
  ) {
    if (
      ![
        id,
        country,
        place,
        totalArea,
        numberOfBedrooms,
        numberOfBathrooms,
        nearbyLandmark,
        ownerID,
      ].every(Boolean)
    )
      return response.status(403).json({ message: "Missing details" });
    else if (id.toString() !== null && !isOwnerIDValid(id.toString()))
      return response
        .status(401)
        .json({ message: "Not authorized to add property" });
    else if (country !== null && !isCountryValid(country))
      return response.status(403).json({ message: "Invalid country" });
    else if (place !== null && !isPlaceValid(place))
      return response.status(403).json({ message: "Invalid place" });
    else if (totalArea !== null && !isTotalAreaValid(totalArea))
      return response.status(403).json({ message: "Invalid area" });
    else if (numberOfBedrooms !== null && !isTotalAreaValid(numberOfBedrooms))
      return response
        .status(403)
        .json({ message: "Invalid number of bedrooms" });
    else if (numberOfBathrooms !== null && !isTotalAreaValid(numberOfBathrooms))
      return response
        .status(403)
        .json({ message: "Invalid number of bathrooms" });
    else if (nearbyLandmark !== null && !isPlaceValid(nearbyLandmark))
      return response.status(403).json({ message: "Invalid nearby landmark" });
    else if (ownerID !== null && !isOwnerIDValid(ownerID.toString())) {
      return response
        .status(401)
        .json({ message: "Not authorized to add property" });
    }
  }

  next();
};
