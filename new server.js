const express = require("express");
const finalhandler = require("finalhandler");
const serveIndex = require("serve-index");
const serveStatic = require("serve-static");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const formidable = require("formidable");
const fs = require("fs");
const app = express();

const PORT = 4000;

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(cookieParser());

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

// cookie parser middleware
app.use(cookieParser());

//username and password

const user = ["alessio0", "marco1", "lele2"];
const password = ["secret", "secret", "secret"];

// a variable to save a session
let Session;

// SHARING POINT
//
// Serve directory indexes for public/ftp folder (with icons)
var index = serveIndex(__dirname + "files", { icons: true });

// Serve up public/ftp folder files
var serve = serveStatic(__dirname + "files");

app.get("/", (req, res) => {
  Session = req.session;
  console.log(Session.userid);
  if (Session.userid) {
    var done = finalhandler(req, res);
    serve(req, res, function onNext(err) {
      if (err) return done(err);
      index(req, res, done);
    });
  } else {
    res.redirect("/index");
  }
});

/////////////////////////////////

app.get("/index", (req, res) => {
  Session = req.session;
  console.log(Session.userid);
  if (Session.userid) {
    res.sendFile("views/chat.html", { root: __dirname });
  } else res.sendFile("views/login.html", { root: __dirname });
});

app.post("/login", (req, res) => {
  let a = req.body.username;
  let b = req.body.password;
  let c = a.slice(-1);
  console.log(a, b, c);

  if (a == user[c] && b == password[c]) {
    //const nome = "alessio";
    Session = req.session;
    Session.userid = req.body.username;
    console.log(Session.userid);
    res.sendFile("views/chat.html", { root: __dirname });
    res.cookie("user", `${Session.userid}`, { path: "/" });
  } else {
    //res.sendFile("views/login.html", { root: __dirname });
  }
});

// CHECK FUNCTION (UPLOAD FILE)

let status;

const check = function (filename) {
  if (/exe|js/g.test(filename)) {
    status = 0;
    return status;
  } else {
    newpath = __dirname + "/files/" + filename;
    console.log(newpath);

    fs.rename(oldpath, newpath, function (err) {
      console.log("file uploaded");
      if (err) throw err;
    });
    status = 1;
    return status;
  }
};

app.post("/fileupload", function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    oldpath = files.filetoupload.path;
    fileName = files.filetoupload.name;
    check(fileName);
    if (status === 0) {
      res.write("Upload NOT Allowed: Illegal Extension!!!");
      return res.end();
    } else {
      res.write("Upload OK");
      return res.end;
    }
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/index");
});

// Listen

app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));
