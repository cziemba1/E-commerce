const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/admin/auth");
const adminProductsRouter = require("./routes/admin/products");
const producstRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    //incript information inside the cookie
    keys: ["skdfjdsklfjl"],
  })
);
app.use(authRouter);
app.use(adminProductsRouter);
app.use(producstRouter);
app.use(cartsRouter);

app.listen(3000, () => {
  console.log("Listening");
});
