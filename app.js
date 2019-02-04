var express = require("express"),
methodOverride = require("method-override"),
app         = express(),
request     = require("request"),
bodyParser  = require("body-parser"),
mongoose    = require("mongoose");
    
//console.log(process.env.DATABASEURL);
//mongoose.connect("mongodb://justin1:Truman911@ds145304.mlab.com:45304/puppypocketbook", {useNewUrlParser:true });

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

app.get("/", function(req, res){
    res.render("index");
});

app.get("/results", function(req, res){
    var database = req.query.database;
    var query = req.query.Seq;
    var url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Put&QUERY=" + query + "&PROGRAM=blastp&DATABASE=" + database;
    res.render("results");
    console.log(url);
    request.put(url, function(error, response, body){
        if (!error && response.statusCode == 200){
            console.log(body);
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING");
});
