const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io/",
});

// ایجاد اتصال به پایگاه داده MySQL
const db = mysql.createConnection({
  host: 'localhost', // یا IP سرور شما در Render
  user: 'root', // نام کاربری MySQL
  password: 'your_password', // رمز عبور
  database: 'your_database', // نام پایگاه داده
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL database!");
});

// 👇 فایل‌های استاتیک مثل index.html, css, js
app.use(express.static(path.join(__dirname, "public")));

// تست ساده برای API
app.get("/api", (req, res) => {
  res.send("Empersia API is running ✅");
});

// WebSocket
io.on("connection", (socket) => {
  console.log("✅ کاربر وصل شد:", socket.id);

  socket.emit("message", "خوش آمدید! اتصال موفق بود.");

  // دریافت داده از پایگاه داده MySQL
  socket.on("get_user_data", (userId) => {
    db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
      if (err) {
        socket.emit("error", "خطا در دریافت داده‌ها از پایگاه داده.");
        console.error(err);
      } else {
        socket.emit("user_data", result);
      }
    });
  });

  // دریافت ping از کلاینت
  socket.on("ping", (data) => {
    console.log("📨 دریافت ping:", data);
    socket.emit("pong", "pong از سرور");
  });

  socket.on("disconnect", () => {
    console.log("❌ کاربر قطع شد:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 سرور Empersia روی پورت ${PORT} اجرا شد`);
});
