require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns= require('dns');
const urlp= require('url');
const { MongoClient }= require('mongodb');
const mySecret =new MongoClient(process.env.DB_URL)
const db= mySecret.db("url_shortner")
const db_url= db.collection("shortening url")
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());

app.use(express.urlencoded({extended:true}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  var url= req.body.url
  const dnslookup = dns.lookup(urlp.parse(url).hostname,async(err,data)=>{
    const urlc= await db_url.countDocuments({})
    const urld={url,short_url:urlc}
    const r = await db_url.insertOne(urld)
    console.log(r)
    return (!data)?res.json({error:"invalid url"})
                  :res.json({ original_url: url,short_url: urlc });
  })
});
app.get("/api/shorturl/:short_url", async(req,res)=>{
  const d= await db_url.findOne({short_url:+req.params.short_url}) 
  res.redirect(d.url);
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
