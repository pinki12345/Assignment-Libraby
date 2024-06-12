const express = require("express");
const router= require("./routers/routers")
const bodyParser = require('body-parser');
const { sequelize } = require("./models");
const cookieParser = require("cookie-parser");



const PORT = 3000;
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use("/",router);
app.use("/api/v1", router);

sequelize.sync().then((result)=>{
    console.log(result);

}).catch((err)=>{
    console.log(err)
});


app.listen(PORT,function() {
    console.log("Application Started....")
})

