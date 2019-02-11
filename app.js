var express = require("express"),
methodOverride = require("method-override"),
app         = express(),
request     = require("request"),
bodyParser  = require("body-parser"),
mongoose    = require("mongoose"),
convert = require('xml-js');
    
//console.log(process.env.DATABASEURL);
//mongoose.connect("mongodb://justin1:Truman911@ds145304.mlab.com:45304/puppypocketbook", {useNewUrlParser:true });

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

app.use("/public", express.static('public')); 

app.get("/", function(req, res){
    res.render("index");
});

app.get("/search", function(req, res){
    res.render("search");    
});

app.get("/waiting", function(req, res){
    var database = req.query.database;
    var query = req.query.Seq;
    /*var url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Put&QUERY=" + query + "&PROGRAM=blastp&DATABASE=" + database;
    console.log(url);
    var RID = undefined;
    request.put(url, function(error, response, body){
        if (!error && response.statusCode == 200){
            var n = body.search("RID = ") + 6;
            RID = body.substring(n, n + 12);
            console.log(RID);
        }
    });
    function checkStatus() {
        console.log("In Loop");
    }
    
    console.log("Before loop");
    setTimeout(checkStatus, 60000);
    console.log("After loop");*/
    
    var getURL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&VIEWRESULTS=FromRes&RID=611YMU5R014&FORMAT_TYPE=XML2_S";
    request.get(getURL, function(error, response, body){
        if (!error && response.statusCode == 200){
            var xml = body;
            var result = convert.xml2json(xml, {compact: true, spaces: 0});
            var unparsedResult = JSON.parse(result);
            var hits = unparsedResult.BlastXML2.BlastOutput2.report.Report.results.Results.search.Search.hits.Hit;
            console.log(hits[0].description.HitDescr.title._text);
            res.render("results", {hits: hits});
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING");
});
