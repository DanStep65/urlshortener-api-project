require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

//add a new custom file that records all of the shorturls, must contain 1 json to prevent error
const shorturl = require(`${process.cwd()}/shorturl`);

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/', (req, res) => {
    
    //regex taken from cloudhadoop and stackoverflow, used to verify the url
    const regexpression = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if(regexpression.test(req.body.url)){
      let url_done = shorturl.filter(obj => {
        return obj.original_url == req.body.url
      });
      if(url_done.length === 0){
        let json_req = {
          original_url: req.body.url,
          short_url: shorturl.length + 1
        };
        shorturl.push(json_req);
        //write the shorturl record in shorturl.json
        fs.writeFile('shorturl.json', JSON.stringify(shorturl), (err) => {
          if(err) return console.log(err);
        });
        res.json(json_req);      
      }
      else{
        res.json(url_done[0]);
      }
    }
    else{
      res.json({"error":"invalid url"});
    }
  });
app.get('/api/shorturl/:num', (req, res) => {
  
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
