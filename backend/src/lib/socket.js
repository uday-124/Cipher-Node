import { Server} from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketauthmiddleware.js";
import User from "../models/User.js";
import EmergencyLog from "../models/EmergencyLog.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

//apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// this is for storing online user
const userSocketMap = {}; //{userid:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit is used to sent event to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("emergency_alert", async (data) => {
    try {
      const { location } = data;
      
      const log = new EmergencyLog({
        userId,
        location,
        status: "triggered"
      });
      await log.save();

      const user = await User.findById(userId).populate("trustedContacts");
      if(user && user.trustedContacts && user.trustedContacts.length > 0) {
        user.trustedContacts.forEach((contact) => {
          const contactIdString = contact._id.toString();
          const contactSocketId = userSocketMap[contactIdString];
          if(contactSocketId) {
            io.to(contactSocketId).emit("emergency_notification", {
              senderId: userId,
              senderName: user.fullName,
              location,
              timestamp: new Date()
            });
          }
        });
      } else {
        // Fallback for demonstration: if no trusted contacts are set, broadcast to all online peers!
        Object.keys(userSocketMap).forEach((id) => {
          if (id !== userId) {
            const contactSocketId = userSocketMap[id];
            io.to(contactSocketId).emit("emergency_notification", {
              senderId: userId,
              senderName: user ? user.fullName : "Someone",
              location,
              timestamp: new Date()
            });
          }
        });
      }
    } catch (error) {
      console.log("Error in emergency_alert target", error);
    }
  });

  //with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
