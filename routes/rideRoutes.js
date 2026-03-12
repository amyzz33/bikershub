const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const rideController = require("../controllers/rideController");


router.post("/", protect, rideController.createRide);

router.get("/", rideController.getRides);

router.get("/:rideId", rideController.getRide);

router.get("/:rideId/route", rideController.getRideRoute);

router.put("/:rideId", protect, rideController.updateRide);

router.delete("/:rideId", protect, rideController.deleteRide);

router.post("/join/:rideId", protect, rideController.joinRide);

router.post("/leave/:rideId", protect, rideController.leaveRide);

router.post("/invite/:rideId/:userId", protect, rideController.inviteToRide);

/* LIVE GPS ROUTE */
router.get("/:rideId/locations", protect, rideController.getRideLocations);


module.exports = router;