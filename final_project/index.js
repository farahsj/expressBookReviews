const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
    const authHeader = req.headers['authorization']; // Get the Authorization header
    if (!authHeader) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) {
        return res.status(403).json({ message: "Token not provided" });
    }

    try {
        const decoded = jwt.verify(token, "fingerprint_customer"); // verify JWT
        req.user = decoded; // store user info for downstream routes
        next(); // proceed to route
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }

});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
