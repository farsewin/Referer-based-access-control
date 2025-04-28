const express = require("express");
const router = express.Router();

const USERS = {
  "administrator": { password: "admin", role: "admin" },
  "wiener": { password: "peter", role: "user" },
  "carlos": { password: "montoya", role: "user" }
};

// GET /
router.get("/", (req, res) => {
  res.render("home", { title: "Home" }); // Pass the title
});


// GET /login
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" }); // Pass the title
});

// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let user = USERS[username];

  if (user && user.password === password) {
    req.session.user = { username, role: user.role }; // Store user role
    res.redirect("/dashboard");
  } else {
    res.send("Invalid credentials.");
  }
});

// GET /dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("dashboard", { 
    title: "Dashboard", 
    user: req.session.user.username,
    role: req.session.user.role 
  }); // Pass the title and user
});

// Admin panel route - vulnerable to Referer-based access control
router.get("/admin", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  
  // Only allow access if user is admin or request comes from an admin page
  const referer = req.get('Referer') || '';
  if (req.session.user.role === 'admin') {
    res.render("admin", { 
      title: "Admin Panel",
      users: Object.keys(USERS).map(username => ({
        username,
        role: USERS[username].role
      }))
    });
  } else {
    res.status(403).send("Access denied");
  }
});

// Admin role management - vulnerable to Referer-based access control
router.get("/admin-roles", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  
  const referer = req.get('Referer') || '';
  const { username, action } = req.query;

  // Vulnerable check - only validates Referer header
  if (referer.includes('/admin')) {
    if (action === 'upgrade' || action === 'downgrade') {
      if (USERS[username]) {
        // Set role based on action
        USERS[username].role = action === 'upgrade' ? 'admin' : 'user';
        // Only redirect, don't try to send another response
        res.redirect('/admin');
      } else {
        res.status(400).send("User not found");
      }
    } else {
      res.status(400).send("Invalid action");
    }
  } else {
    res.status(403).send("Access denied");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.send("Error logging out. Please try again.");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/"); // Redirect to the home page
  });
});

module.exports = router;
