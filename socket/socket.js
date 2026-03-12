const { Server } = require("socket.io");
const Ride = require("../models/Ride");

let io;
const initSocket = (server) => {

  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    /* JOIN CONVERSATION ROOM */
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log("Joined conversation:", conversationId);
    });

    /* SEND MESSAGE (REALTIME) */
    socket.on("sendMessage", (data) => {

      const { conversationId } = data;

      io.to(conversationId).emit("receiveMessage", data);

    });

    /* USER TYPING */
    socket.on("typing", (data) => {

      socket.to(data.conversationId).emit("typing", {
        senderId: data.senderId
      });

    });

    /* STOP TYPING */
    socket.on("stopTyping", (data) => {

      socket.to(data.conversationId).emit("stopTyping", {
        senderId: data.senderId
      });

    });

    /* DISCONNECT */
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
    /* joi ride room */
    socket.on("joinRide", ({ rideId }) => {

  socket.join(`ride:${rideId}`);

  console.log("Joined ride room:", rideId);

});

socket.on("leaveRide", ({ rideId }) => {

  socket.leave(`ride:${rideId}`);

});

socket.on("rideLocationUpdate", async (data) => {

  try {

    const { rideId, userId, lat, lng } = data;

    const ride = await Ride.findById(rideId);

    if (!ride) return;

    /* ---------------------------
       SAVE ROUTE POINT
    ---------------------------- */

    if (!ride.route) {
      ride.route = {
        type: "LineString",
        coordinates: []
      };
    }

    ride.route.coordinates.push([lng, lat]);


    /* ---------------------------
       UPDATE RIDER LIVE LOCATION
    ---------------------------- */

    const existing = ride.riderLocations.find(
      r => r.user.toString() === userId
    );

    if (existing) {

      existing.location.coordinates = [lng, lat];
      existing.updatedAt = new Date();

    } else {

      ride.riderLocations.push({
        user: userId,
        location: {
          type: "Point",
          coordinates: [lng, lat]
        }
      });

    }

    await ride.save();

    /* ---------------------------
       BROADCAST TO RIDERS
    ---------------------------- */

    io.to(`ride:${rideId}`).emit("riderLocationUpdated", {
      userId,
      lat,
      lng
    });

  } catch (error) {
    console.error(error);
  }

});

socket.on("joinClubChat", ({ clubId }) => {

  socket.join(`club:${clubId}`);

});

socket.on("sendClubMessage", (data) => {

  const { clubId } = data;

  io.to(`club:${clubId}`).emit("receiveClubMessage", data);

});

socket.on("joinRideChat", ({ rideId }) => {

  socket.join(`rideChat:${rideId}`);

});

socket.on("sendRideMessage", async (data) => {

  const { rideId, message } = data;

  io.to(`rideChat:${rideId}`).emit("receiveRideMessage", data);

});

/* JOIN POST ROOM (FOR REALTIME COMMENTS) */
socket.on("joinPost", (postId) => {
  socket.join(`post:${postId}`);
  console.log("Joined post room:", postId);
});

  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };