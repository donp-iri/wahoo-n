const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const tmp = require('tmp');
const fs = require('fs');

const port = 3000

//app.use(express.json()) // for parsing application/json
//app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(bodyParser.text())

app.get('/', (req, res) => res.json({ ping:'pong' }))

app.post('/script', function (req, res) {
    const { exec } = require('child_process')
    var tmpFile = tmp.fileSync({dir: './', postfix: '.scl'});
    console.log('Created temporary filename: ', tmpFile.name);
    fs.writeSync(tmpFile.fd, (String) (req.body))
    fs.closeSync(tmpFile.fd)
    var cmd = 'sortcl /SPECIFICATION=' + tmpFile.name
    console.log(cmd)
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.json({ error:err })
        } else {
            // stdout (buffered)
            let capture = stdout
            res.send(capture)
        }
        fs.unlinkSync(tmpFile.name)
    })
})

app.post('/run', function (req, res) {
    const { exec } = require('child_process')
    var cmd = 'sortcl ' + req.body
    console.log(cmd)
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.json({ error:err })
        } else {
            // stdout (buffered)
            let capture = stdout
            res.send(capture)
        }
    })
})

app.post('/test', function (req, res) {
    console.log(req.body)
    res.send(req.body)
})

app.get('/version', function (req, res) {
    const { exec } = require('child_process')
    exec('sortcl /v', (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.json({ error:err })
        } else {
            // stdout (buffered)
            let capture = stdout
            let val = capture.match("(\\w+) ([\\d.]+) ([A-Z][\\d-]+) (\\w+)")
            res.json({ product:val[1], version:val[2], tag:val[3], arch:val[4] })
        }
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
