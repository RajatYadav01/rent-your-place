const router = require("express").Router();
const validation = require("../middleware/user-validation");
const authorization = require("../middleware/authorization");
const userController = require("../controllers/user-controller");

router.post("/new", validation, userController.newUser);

router.post("/authenticate", validation, userController.authenticate);

router.get("/verify", authorization, userController.verify);

router.get("/get", authorization, userController.getUser);

router.get("/getID", authorization, userController.getID);

router.patch("/update", validation, userController.updateUser);

router.patch("/resetPassword", validation, userController.resetPassword);

router.delete("/delete", authorization, userController.deleteUser);

module.exports = router;
