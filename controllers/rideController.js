const Ride = require("../models/Ride");
const Notification = require("../models/Notification");

/*
CREATE RIDE
*/
exports.createRide = async (req, res) => {
  try {

    /* CREATE RIDE */
    const ride = await Ride.create({
      ...req.body,
      createdBy: req.user.id,
      participants: [req.user.id],
      participantsCount: 1
    });

    /* CREATE RIDE CHAT CONVERSATION */
    await Conversation.create({
      type: "ride",
      ride: ride._id,
      participants: [req.user.id]
    });

    res.status(201).json(ride);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
GET ALL RIDES
*/
exports.getRides = async (req, res) => {
  try {

    const rides = await Ride.find()
      .populate("createdBy", "username")
      .sort({ rideDate: 1 });

    res.json(rides);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
GET SINGLE RIDE
*/
exports.getRide = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId)
      .populate("createdBy", "username")
      .populate("participants", "username");

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    res.json(ride);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
UPDATE RIDE
*/
exports.updateRide = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId);

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    if (ride.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    Object.assign(ride, req.body);

    await ride.save();

    res.json(ride);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
JOIN RIDE
*/
exports.joinRide = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId);

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    if (ride.participants.includes(req.user.id))
      return res.status(400).json({ msg: "Already joined ride" });

    if (ride.participants.length >= ride.maxParticipants)
      return res.status(400).json({ msg: "Ride is full" });

    ride.participants.push(req.user.id);
    ride.participantsCount += 1;

    await ride.save();

    if (ride.createdBy.toString() !== req.user.id) {

      await Notification.create({
        recipient: ride.createdBy,
        sender: req.user.id,
        type: "ride_join",
        ride: ride._id
      });

    }

    res.json({ msg: "Joined ride successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
LEAVE RIDE
*/
exports.leaveRide = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId);

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    if (ride.createdBy.toString() === req.user.id)
      return res.status(400).json({ msg: "Creator cannot leave ride" });

    ride.participants = ride.participants.filter(
      id => id.toString() !== req.user.id
    );

    ride.participantsCount -= 1;

    await ride.save();

    res.json({ msg: "Left ride successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
INVITE USER TO RIDE
*/
exports.inviteToRide = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId);

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    if (ride.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    await Notification.create({
      recipient: req.params.userId,
      sender: req.user.id,
      type: "ride_invite",
      ride: ride._id
    });

    res.json({ msg: "Ride invitation sent" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
DELETE RIDE
*/
exports.deleteRide = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId);

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    if (ride.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    await ride.deleteOne();

    res.json({ msg: "Ride deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*
GET LIVE GPS LOCATIONS
*/
exports.getRideLocations = async (req, res) => {
  try {

    const ride = await Ride.findById(req.params.rideId)
      .populate("riderLocations.user", "username");

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    res.json(ride.riderLocations);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
GET RIDE ROUTE (for replay)
*/
exports.getRideRoute = async (req, res) => {
  try {

    const Ride = require("../models/Ride");

    const ride = await Ride.findById(req.params.rideId)
      .select("route totalDistance rideDuration averageSpeed");

    if (!ride)
      return res.status(404).json({ msg: "Ride not found" });

    res.json({
      route: ride.route?.coordinates || [],
      totalDistance: ride.totalDistance,
      duration: ride.rideDuration,
      avgSpeed: ride.averageSpeed
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};