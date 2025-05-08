const router = require("express").Router();
const propertyValidation = require("../middleware/property-validation");
const propertyController = require("../controllers/property-controller");

router.post("/new", propertyValidation, propertyController.newProperty);

router.get("/get", propertyController.getAllProperties);

router.get("/get-owner", propertyValidation, propertyController.getOwner);

router.patch("/update", propertyValidation, propertyController.updateProperty);

router.patch(
  "/unlikeProperty",
  propertyValidation,
  propertyController.unlikeProperty
);

router.delete("/delete", propertyController.deleteProperty);

module.exports = router;
