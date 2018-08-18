var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path'); //used for file path
var fs = require('fs-extra');
var Promise = require('promise');
var exec = require('child_process').exec
var request = require('request');

const fileUpload = require('express-fileupload');

const { Connection, query } = require('stardog');
 
const conn = new Connection({
  username: 'admin',
  password: 'admin',
  endpoint: 'http://10.1.6.12:5820',
});


var appRouter = function (app) {
    app.get("/", function (req, res) {
        console.log("hey")
        res.status(200).send("Welcome to our restful API");
    });

    app.use(fileUpload());

    app.post('/upload', async function (req, res) {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        var sampleFile = req.files.sampleFile;


        createStarDogDB(sampleFile.name)

        // Use the mv() method to place the file somewhere on your server
       // console.log(sampleFile)
       // console.log(sampleFile.data.toString('utf8'))
        //console.log()
        sampleFile.mv(__dirname + '/img/' + sampleFile.name, function (err) {
            if (err)
                return res.status(500).send(err);

            var path = __dirname + '/img/myfile.txt'
            var jsonobj = {
                "input": "\""+sampleFile.data.toString('utf8')+"\"",
                "type": "text",
                "task": "ner",
                "output": "jsonld",
                "lang": "en",
                "foxlight": "org.aksw.fox.tools.ner.en.IllinoisExtendedEN"
            }

            console.log(jsonobj)

            fox(jsonobj);

            bart(sampleFile.data.toString('utf8'))

            res.send('File uploaded!');
        });
    });

    /*  async function fox(path){

       var child = exec("", 
                  function (error, stdout, stderr) {
                      console.log('stdout: ' + stdout);
                      console.log('stderr: ' + stderr);
                      if (error !== null) {
                          console.log('exec error: ' + error);
                      }
                  });
              child.stdout.on('data', function (data) {
                  //pendingfiles();
                  console.log(data)
                  dataf.push(data);





              })
              child.on("close", function () {



               }) */

    // }

    function fox(data) {
        request.post({
            url: 'http://localhost:4444/fox',
            json: true,
            headers: {  
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: data

        }, function (err, httpResponse, body) {
            /* ... */
            //console.log(JSON.stringify(body));
            fs.writeFile(__dirname + '/data.json', JSON.stringify(body, null, 2) , 'utf-8');
            console.log("Completed FOX")
        })
    }

    function bart(data){
        request.post({
            url:'http://localhost:8125/BARTDemo/ShowText/process/',
            body:data
        }, function (err, httpResponse, body) {
            /* ... */
          //  console.log(JSON.stringify(body));
            
            fs.writeFile(__dirname + '/data1.xml', JSON.stringify(body, null, 2) , 'utf-8');
            console.log("Completed BART")
        })
    }

    function createStarDogDB(name){
        console.log("DB created")
    }



}

module.exports = appRouter;