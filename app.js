var express = require("express"),
app         = express(),
request     = require("request"),
bodyParser  = require("body-parser"),
mongoose    = require("mongoose"),
convert = require('xml-js');
var moment = require('moment');
moment().format();
app.locals.moment = moment;

//mongoose.connect("mongodb://localhost/BLAST",  {useNewUrlParser:true });
mongoose.connect("mongodb://justin1:Truman911@ds137255.mlab.com:37255/blastsearch", {useNewUrlParser:true });

//APP CONFIG
app.set("view engine", "ejs");
app.use("/public", express.static('public')); 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

//MONGOOSE/MODEL CONFIG
var hitArrSchema = new mongoose.Schema({
    title: String,
    Evalue: String
});

var searchSchema = new mongoose.Schema({
    title: String,
    hits: [hitArrSchema],
    database: String,
    hit:{ type : Array , "default" : [] },
    created: {type: Date, default: Date.now},
    status: String
});

var Search = mongoose.model("Search", searchSchema);
var BlastHit = mongoose.model("BlastHit", hitArrSchema);

function compare(a,b) {
  if (a.created < b.created)
    return -1;
  if (a.created > b.created)
    return 1;
  return 0;
}

//ROUTES
app.get("/", function(req, res){
    res.render("index");
});

app.get("/search", function(req, res){
    res.render("search");    
});

app.get("/pastSearch", function(req, res){
    Search.find({}, function(err, searches){
                if(err){
                    console.log("ERROR!");
                } else{
                    res.render("searchHistory", {searches: searches});
                }
            });
});


app.get("/results/:id", function(req, res){
    Search.findById(req.params.id, function(err, foundSearch){
        if (err){
            res.redirect("/pastSearch");
        } else{
            //pass found search through under the name dog to the show template
            res.render("results", {search: foundSearch});
        }
    })
});

app.post("/search", function(req, res){
    var database = req.body.database;
    var query = req.body.Seq;
    var id;
    
    Search.create({
        title: req.body.title,
        database: database,
        status: "SEARCHING",
    }, function(err, search){
        if(err){
            console.log(err);
        }
        else{
            id = search._id;
           res.redirect("/pastSearch");
        }
    });
    
    var url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Put&QUERY=" + query + "&PROGRAM=blastp&DATABASE=" + database;
    console.log(url);
    var RID = undefined;
 
    request.put(url, function(error, response, body){
        if (!error && response.statusCode == 200){
            var n = body.search("RID = ") + 6;
            RID = body.substring(n, n + 12);
            console.log(RID.trim());
            if(RID.trim() == "RTOE ="){
                Search.findByIdAndUpdate(id, {status: "ERROR"}, function(err){console.log(err);});
            }
            return;
        }
    });
    var refreshId = setInterval(function(){
        var getURL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&RID=" + RID;
        request.get(getURL, function(error, response, body){
            if (!error && response.statusCode == 200){
                var statusIndex = body.search("Status=") + 7;
                var status = body.substring(statusIndex, statusIndex + 5);
                console.log(status);
                if(status == "UNKNO"){
                    console.log("Well here we are");
                    Search.findByIdAndUpdate(id, {status: "ERROR"}, function(err){console.log(err);});
                    clearInterval(refreshId);
                }
                if(status == "READY"){
                    var resultsURL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&VIEW_RESULTS=FromRes&RID=" + RID + "&FORMAT_TYPE=XML2_S";
                    request.get(resultsURL, function(error, response, innerBody){
                        if (!error && response.statusCode == 200){
                            var xml = innerBody;
                            try{
                            var result = convert.xml2json(xml, {compact: true, spaces: 0});
                            var unparsedResult = JSON.parse(result);
                            var hits = unparsedResult.BlastXML2.BlastOutput2.report.Report.results.Results.search.Search.hits.Hit.slice(0, 11);
                            console.log(id);
                                Search.findByIdAndUpdate(id, {status: "READY"}, function(err){console.log(err);});
                                for (let i = 0; i < 11; i++){
                                    Search.findByIdAndUpdate(id,
                                    {
                                        $push : {
                                            "hit" :  {
                                                "title": (Array.isArray(hits[i].description.HitDescr) ? hits[i].description.HitDescr[0].title._text :  hits[i].description.HitDescr.title._text),
                                                "Evalue": hits[i].hsps.Hsp.evalue._text,
                                             } //inserted data is the object to be inserted 
                                        }
                                    },
                                        {new: true},
                                        function(err, model) {
                                            if(err){
                                                Search.findByIdAndUpdate(id, {status: "ERROR"});
                                                clearInterval(refreshId);
                                            }
                                        }
                                    );
                                }
                                clearInterval(refreshId);
                            }
                            catch(err){
                                 Search.findByIdAndUpdate(id, {status: "ERROR"});
                                clearInterval(refreshId);
                            }
                        }
                        else{
                            Search.findByIdAndUpdate(id, {status: "ERROR"});
                            clearInterval(refreshId);
                        }
                        
                    });
                    
                }
            }
            else {
                Search.findByIdAndUpdate(id, {status: "ERROR"});
                clearInterval(refreshId);
            }
        });
    }, 60000);
    
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING");
});
