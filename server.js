const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts"); // Import express-ejs-layouts

const app = express();

app.use(express.static("public"));

// Add middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(cookieParser());
app.use(
  session({
    secret: "aloalo25", // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Configure EJS and express-ejs-layouts
app.use(expressLayouts); // Enable express-ejs-layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout"); // Set the default layout file

// Middleware to pass the logged-in user to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Pass the logged-in user to all views
  next();
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
