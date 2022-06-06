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
      //when body.url passed the test, filter out the shortened url record and see if there are matches
      let url_done = shorturl.filter(obj => {
        return obj.original_url == req.body.url
      });
      //if none matches
      if(url_done.length === 0){
        //add the body url to an object with its short_url id
        let json_req = {
          original_url: req.body.url,
          short_url: shorturl.length + 1
        };
        //push the body url to the existing json in the shorturl
        shorturl.push(json_req);
        //write the pushed shorturl record back in shorturl.json
        fs.writeFile('shorturl.json', JSON.stringify(shorturl), (err) => {
          if(err) return console.log(err);
        });
        //send the object to the browser
        res.json(json_req);      
      }
      else{
        //return the one and only object from the filtered array of original_url that matched the body.url to the browser
        res.json(url_done[0]);
      }
    }
    else{
      //return error object
      res.json({"error":"invalid url"});
    }
  });
app.get('/api/shorturl/:num', (req, res) => {
  //filter out the shortened url record based on the short_url id and see if there are matches
  const url = shorturl.filter(obj => {
    return req.params.num == obj['short_url'];
  });
  //if none found, return "Not Found"
  if(url.length === 0){
    res.send('Not Found');
  }
  else{
    //redirect the browser to the original url.
    res.redirect(url[0]['original_url']);
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
