## App Structure
```md
src/
├── config/
│   ├── db.ts
│   ├── socket.ts
│   └── constants.ts
├── controllers/
│   ├── authController.ts
│   ├── messageController.ts
│   └── userController.ts
├── models/
│   ├── User.ts
│   └── Message.ts
├── routes/
│   ├── authRoutes.ts
│   ├── messageRoutes.ts
│   └── userRoutes.ts
├── middlewares/
│   ├── authMiddleware.ts
│   └── errorHandler.ts
├── sockets/
│   ├── index.ts
│   ├── messageHandlers.ts
│   └── userHandlers.ts
├── services/
│   ├── authService.ts
│   ├── messageService.ts
│   └── userService.ts
├── utils/
│   ├── jwtHelper.ts
│   ├── logger.ts
│   └── validators.ts
├── types/
│   ├── auth.types.ts
│   ├── message.types.ts
│   └── user.types.ts
├── app.ts
└── server.ts
```