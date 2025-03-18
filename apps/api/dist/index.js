'use strict';

var dotenv = require('dotenv');
var path = require('path');
var http = require('http');
var express4 = require('express');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var client = require('@prisma/client');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cloudinary = require('cloudinary');
var multerStorageCloudinary = require('multer-storage-cloudinary');
var multer = require('multer');
var socket_io = require('socket.io');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var dotenv__default = /*#__PURE__*/_interopDefault(dotenv);
var path__default = /*#__PURE__*/_interopDefault(path);
var http__default = /*#__PURE__*/_interopDefault(http);
var express4__default = /*#__PURE__*/_interopDefault(express4);
var cookieParser__default = /*#__PURE__*/_interopDefault(cookieParser);
var cors__default = /*#__PURE__*/_interopDefault(cors);
var bcrypt__default = /*#__PURE__*/_interopDefault(bcrypt);
var jwt__default = /*#__PURE__*/_interopDefault(jwt);
var multer__default = /*#__PURE__*/_interopDefault(multer);

// src/index.ts
var prisma = new client.PrismaClient();
var generateJwtToken = (userId, res) => {
  const token = jwt__default.default.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
  if (res) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days
    });
  }
  return token;
};

// src/controllers/user.controller.ts
var userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please provide all fields."
      });
      return;
    }
    if (password?.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters."
      });
      return;
    }
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      res.status(400).json({
        message: "User with the provided email already exist."
      });
      return;
    }
    const salt = await bcrypt__default.default.genSalt(10);
    const hashedPassword = await bcrypt__default.default.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    generateJwtToken(newUser.id, res);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Internal server error."
    });
  }
};
var userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide all fields."
      });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    });
    if (!user || !user.password) {
      res.status(400).json({
        message: "Invalid credentials."
      });
      return;
    }
    const isMatch = await bcrypt__default.default.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        message: "Invalid credentials."
      });
      return;
    }
    generateJwtToken(user.id, res);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Internal server error."
    });
  }
};
var logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logged out successfully."
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "Internal server error."
    });
  }
};
var checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("CheckAuth Error:", error);
    res.status(500).json({
      message: "Internal server error."
    });
  }
};
var deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId
      }
    });
    if (!deletedUser) {
      res.status(404).json({
        message: "User not found."
      });
      return;
    }
    res.status(200).json({
      message: "User deleted successfully."
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      message: "Internal server error."
    });
  }
};
var isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt__default.default.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });
    if (!user) {
      return res.status(401).json({
        message: "User not found."
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({
      message: "Authentication failed. Please log in again."
    });
  }
};

// src/routes/user.route.ts
var router = express4__default.default.Router();
router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/logout").post(logout);
router.route("/checkAuth").get(isLoggedIn, checkAuth);
router.route("/:id").delete(isLoggedIn, deleteUser);
var user_route_default = router;
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "xenia-communities",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});
var uploadMiddleware = multer__default.default({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB max file size
  }
});
var upload = {
  ...uploadMiddleware,
  optional: () => ({
    ...uploadMiddleware,
    single: (fieldName) => (req, res, next) => {
      if (!req.files && !req.file) {
        return next();
      }
      return uploadMiddleware.single(fieldName)(req, res, next);
    }
  })
};
var deleteImage = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};
var getPublicIdFromUrl = (url) => {
  const splits = url.split("/");
  const filename = splits[splits.length - 1] || "";
  return `xenia-communities/${filename.split(".")[0]}`;
};

// src/controllers/community.controller.ts
var createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    if (!name) {
      res.status(400).json({ message: "Community name is required" });
      return;
    }
    if (name.length > 100) {
      res.status(400).json({ message: "Community name must be less than 100 characters" });
      return;
    }
    const existingCommunity = await prisma.community.findFirst({
      where: { name }
    });
    if (existingCommunity) {
      res.status(400).json({ message: "Community name already exists" });
      return;
    }
    const community = await prisma.$transaction(async (tx) => {
      const newCommunity = await tx.community.create({
        data: {
          name,
          description,
          ...req.file?.path && { image: req.file.path },
          ownerId: userId,
          members: {
            create: {
              userId,
              role: "OWNER"
            }
          }
        }
      });
      await tx.chat.create({
        data: {
          communityId: newCommunity.id
        }
      });
      return newCommunity;
    });
    res.status(201).json(community);
  } catch (error) {
    console.error("Create Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        chats: {
          include: {
            messages: {
              take: 10,
              orderBy: {
                createdAt: "desc"
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    res.status(200).json(community);
  } catch (error) {
    console.error("Get Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getAllCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;
    const where = search ? {
      name: {
        contains: search,
        mode: "insensitive"
      }
    } : {};
    if (req.query.page || req.query.limit || req.query.search) {
      const [communities, total] = await Promise.all([
        prisma.community.findMany({
          where,
          skip,
          take: limit,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            _count: {
              select: {
                members: true
              }
            }
          }
        }),
        prisma.community.count({ where })
      ]);
      res.status(200).json({
        communities,
        total,
        hasMore: total > skip + limit
      });
    } else {
      const communities = await prisma.community.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      });
      res.status(200).json(communities);
    }
  } catch (error) {
    console.error("Get All Communities Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;
    const community = await prisma.community.findUnique({
      where: { id }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    if (community.ownerId !== userId) {
      res.status(403).json({ message: "Not authorized to update this community" });
      return;
    }
    if (name) {
      const existingCommunity = await prisma.community.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      if (existingCommunity) {
        res.status(400).json({ message: "Community name already exists" });
        return;
      }
    }
    if (req.file?.path && community.image) {
      const publicId = getPublicIdFromUrl(community.image);
      await deleteImage(publicId);
    }
    const updatedCommunity = await prisma.community.update({
      where: { id },
      data: {
        name,
        description,
        ...req.file?.path && { image: req.file.path }
      }
    });
    res.status(200).json(updatedCommunity);
  } catch (error) {
    console.error("Update Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const community = await prisma.community.findUnique({
      where: { id }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    if (community.ownerId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this community" });
      return;
    }
    if (community.image) {
      const publicId = getPublicIdFromUrl(community.image);
      await deleteImage(publicId);
    }
    await prisma.community.delete({
      where: { id }
    });
    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Delete Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: true
      }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    const existingMembership = community.members.find(
      (m) => m.userId === userId
    );
    if (existingMembership) {
      res.status(400).json({ message: "User is already a member of this community" });
      return;
    }
    const membership = await prisma.communitiesOnUsers.create({
      data: {
        communityId: id,
        userId,
        role: "MEMBER"
      }
    });
    res.status(200).json(membership);
  } catch (error) {
    console.error("Join Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: true
      }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    if (community.ownerId === userId) {
      res.status(400).json({ message: "Owner cannot leave the community" });
      return;
    }
    const membership = community.members.find((m) => m.userId === userId);
    if (!membership) {
      res.status(400).json({ message: "User is not a member of this community" });
      return;
    }
    await prisma.communitiesOnUsers.delete({
      where: {
        communityId_userId: {
          communityId: id,
          userId
        }
      }
    });
    res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    console.error("Leave Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const [members, total] = await Promise.all([
        prisma.communitiesOnUsers.findMany({
          where: { communityId: id },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }),
        prisma.communitiesOnUsers.count({
          where: { communityId: id }
        })
      ]);
      res.status(200).json({
        members: members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
          role: member.role
        })),
        total,
        hasMore: total > skip + limit
      });
    } else {
      const members = await prisma.communitiesOnUsers.findMany({
        where: { communityId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });
      const formattedMembers = members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: member.role
      }));
      res.status(200).json(formattedMembers);
    }
  } catch (error) {
    console.error("Get Community Members Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getUserCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const communities = await prisma.communitiesOnUsers.findMany({
      where: { userId },
      include: {
        community: {
          include: {
            _count: {
              select: {
                members: true
              }
            },
            chats: {
              include: {
                messages: {
                  take: 1,
                  orderBy: {
                    createdAt: "desc"
                  },
                  include: {
                    sender: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    res.status(200).json(communities);
  } catch (error) {
    console.error("Get User Communities Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// src/routes/community.route.ts
var router2 = express4__default.default.Router();
router2.post("/", isLoggedIn, upload.optional().single("image"), createCommunity);
router2.get("/", getAllCommunities);
router2.get("/user", isLoggedIn, getUserCommunities);
router2.get("/:id", getCommunity);
router2.put("/:id", isLoggedIn, upload.optional().single("image"), updateCommunity);
router2.delete("/:id", isLoggedIn, deleteCommunity);
router2.post("/:id/join", isLoggedIn, joinCommunity);
router2.post("/:id/leave", isLoggedIn, leaveCommunity);
router2.get("/:id/members", getCommunityMembers);
var community_route_default = router2;
var prisma2 = new client.PrismaClient();

// src/controllers/chat.controller.ts
var createChat = async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.user.id;
    if (!communityId) {
      res.status(400).json({ message: "Community ID is required" });
      return;
    }
    const community = await prisma2.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: { userId }
        }
      }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    if (community.members.length === 0) {
      res.status(403).json({ message: "You must be a member of the community to create a chat" });
      return;
    }
    const newChat = await prisma2.chat.create({
      data: {
        communityId
      }
    });
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Create Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getCommunityChats = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const community = await prisma2.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: { userId }
        }
      }
    });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    const isMember = community.members.length > 0 || community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to view chats" });
      return;
    }
    const chats = await prisma2.chat.findMany({
      where: {
        communityId
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Get Community Chats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const chat = await prisma2.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        community: {
          include: {
            members: {
              where: { userId }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat room not found" });
      return;
    }
    const isMember = chat.community.members.length > 0 || chat.community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to view this chat" });
      return;
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error("Get Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const chat = await prisma2.chat.findUnique({
      where: { id: chatId },
      include: {
        community: true
      }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat room not found" });
      return;
    }
    const userRole = await prisma2.communitiesOnUsers.findUnique({
      where: {
        communityId_userId: {
          communityId: chat.communityId,
          userId
        }
      }
    });
    if (chat.community.ownerId !== userId && (!userRole || userRole.role !== "ADMIN")) {
      res.status(403).json({ message: "Not authorized to delete this chat room" });
      return;
    }
    await prisma2.chat.delete({
      where: { id: chatId }
    });
    res.status(200).json({ message: "Chat room deleted successfully" });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var io;
var authenticateSocket = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("Authentication failed: No cookies provided"));
    }
    const cookieArray = cookies.split(";").map((cookie) => cookie.trim());
    const tokenCookie = cookieArray.find((cookie) => cookie.startsWith("token="));
    if (!tokenCookie) {
      return next(new Error("Authentication failed: No token cookie"));
    }
    const token = tokenCookie.split("=")[1];
    if (!process.env.JWT_SECRET) {
      return next(new Error("JWT_SECRET is not configured"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return next(new Error("Authentication failed: Invalid token"));
    }
    const user = await prisma2.user.findUnique({
      where: { id: decoded.id }
    });
    if (!user) {
      return next(new Error("Authentication failed: User not found"));
    }
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
};
var initSocketServer = (server2) => {
  io = new socket_io.Server(server2, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    // Increase ping timeout to prevent premature disconnections
    pingTimeout: 6e4
  });
  io.use(authenticateSocket);
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user?.id}`);
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user?.id} joined room ${roomId}`);
    });
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user?.id} left room ${roomId}`);
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user?.id}`);
    });
  });
};

// src/controllers/message.controller.ts
var createMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    const userId = req.user.id;
    if (!content || !chatId) {
      res.status(400).json({ message: "Content and chat ID are required" });
      return;
    }
    const chat = await prisma2.chat.findUnique({
      where: { id: chatId },
      include: { community: { include: { members: true } } }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    const isMember = chat.community.members.some((member) => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this community" });
      return;
    }
    const message = await prisma2.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
        communityId: chat.communityId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    io.to(chatId).emit("newMessage", message);
    res.status(201).json(message);
  } catch (error) {
    console.error("Create Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getMessagesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const chat = await prisma2.chat.findUnique({
      where: { id: chatId },
      include: { community: { include: { members: true } } }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    const isMember = chat.community.members.some((member) => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this community" });
      return;
    }
    const total = await prisma2.message.count({
      where: { chatId }
    });
    const messages = await prisma2.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    res.status(200).json({
      messages,
      total,
      hasMore: total > skip + limit,
      page,
      limit
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content) {
      res.status(400).json({ message: "Content is required" });
      return;
    }
    const message = await prisma2.message.findUnique({
      where: { id },
      include: { chat: true }
    });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    if (message.senderId !== userId) {
      res.status(403).json({ message: "You can only edit your own messages" });
      return;
    }
    const updatedMessage = await prisma2.message.update({
      where: { id },
      data: { content },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    if (message.chatId) {
      io.to(message.chatId).emit("messageUpdated", updatedMessage);
    }
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Update Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const message = await prisma2.message.findUnique({
      where: { id },
      include: { chat: true }
    });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    if (message.senderId !== userId) {
      res.status(403).json({ message: "You can only delete your own messages" });
      return;
    }
    const chatId = message.chatId;
    await prisma2.message.delete({
      where: { id }
    });
    if (chatId) {
      io.to(chatId).emit("messageDeleted", { id });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// src/routes/chat.route.ts
var router3 = express4__default.default.Router();
router3.post("/", isLoggedIn, createChat);
router3.get("/community/:communityId", isLoggedIn, getCommunityChats);
router3.get("/:chatId", isLoggedIn, getChatById);
router3.delete("/:chatId", isLoggedIn, deleteChat);
router3.post("/messages", isLoggedIn, createMessage);
router3.get("/:chatId/messages", isLoggedIn, getMessagesByChat);
router3.patch("/messages/:id", isLoggedIn, updateMessage);
router3.delete("/messages/:id", isLoggedIn, deleteMessage);
var chat_route_default = router3;
dotenv__default.default.config({ path: path__default.default.resolve(process.cwd(), ".env") });
var app = express4__default.default();
app.use(express4__default.default.json());
app.use(cookieParser__default.default());
app.use(cors__default.default({
  origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.FRONTEND_URL,
  credentials: true
}));
app.get("/", (_, res) => {
  res.send("API is running...");
});
app.use("/api/user", user_route_default);
app.use("/api/communities", community_route_default);
app.use("/api/chats", chat_route_default);
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : void 0
  });
});
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});
var app_default = app;

// src/index.ts
dotenv__default.default.config({ path: path__default.default.resolve(process.cwd(), ".env") });
if (!process.env.JWT_SECRET) {
  console.error("Critical environment variable JWT_SECRET is missing!");
  console.error("Please check your .env file");
  process.exit(1);
}
var PORT = parseInt(process.env.PORT || "8000", 10);
var server = http__default.default.createServer(app_default);
initSocketServer(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason.message);
});
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map