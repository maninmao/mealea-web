# mealea-web

npm install express mongoose cors dotenv bcrypt jsonwebtoken stripe

mealea-restaurant/
│
├── client/                         # Frontend (HTML, CSS, JS)
│   ├── pages/
│   │   ├── index.html              # Home
│   │   ├── menu.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── reservation.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── admin.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── navbar.css
│   │
│   ├── js/
│   │   ├── api.js                  
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── reservation.js
│   │   ├── admin.js
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── server/                         # Backend 
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Menu.js
│   │   ├── Order.js
│   │   ├── Reservation.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reservationRoutes.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── reservationController.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── menuService.js
│   │   ├── orderService.js
│   │   ├── reservationService.js
│   │    
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │
│   ├── utils/
│   │   └── stripe.js
│   │
│   ├── server.js           #node server.js
│   └── .env
│
├── README.md
└── .gitignore