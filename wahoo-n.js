/**
 * NodeJS web service for IRI RowGen.
 *
 * Main index file.
 *
 * @link   https://github.com/donp-iri/wahoo-n
 * @author Don Purnhagen
 * @copyright Copyright (c) 2020 Innovative Routines International (IRI), Inc.
 */

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const tmp = require('tmp');
const fs = require('fs');
const process = require('child_process')

const port = 3000

// For parsing: application/x-www-form-urlencoded
//app.use(express.urlencoded({ extended: true }))
// For parsing: application/octet-stream
//app.use(bodyParser.raw())

// For parsing: application/json
app.use(express.json())

// For parsing: text/plain
app.use(bodyParser.text())

app.get('/', (req, res) => res.json({ ping:'pong' }))

app.get('/rowgen/:cmd', function (req, res) {
    let cmd = req.params.cmd
    console.log(cmd)
    process.exec(cmd, { cwd:"rowgen" }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.json({ error:err })
        } else {
            let capture = stdout
            res.send(capture)
        }
    })
})

app.post('/script', function (req, res) {
    var tmpFile = tmp.fileSync({dir: './', postfix: '.scl'});
    console.log('Created temporary file: ', tmpFile.name);
    fs.writeSync(tmpFile.fd, (String) (req.body))
    fs.closeSync(tmpFile.fd)
    var cmd = 'sortcl /SPECIFICATION=' + tmpFile.name
    console.log(cmd)
    process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.json({ error:err })
        } else {
            let capture = stdout
            res.send(capture)
        }
        fs.unlinkSync(tmpFile.name)
        console.log('Removed temporary file: ', tmpFile.name);
    })
})

app.post('/run', function (req, res) {
    var cmd = 'sortcl ' + req.body
    console.log(cmd)
    process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.json({ error:err })
        } else {
            let capture = stdout
            res.send(capture)
        }
    })
})

app.post('/cmd', function (req, res) {
    var cmd = req.body.command
    console.log(cmd)
    var ret = req.body.return
    console.log(ret)
    process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.json({ error:err })
        } else {
            var capture
            if (ret != undefined && ret != 'stdout') {
                // Open and return the contents of ret.
                try {
                    let fh = fs.openSync(ret)

                } catch (err2) {
                    capture = 'Cannot open file: ' + ret
                }
                capture = "Open and return the contents."
            } else {
                capture = stdout
            }
            res.send(capture)
        }
    })
})

app.get('/rc', function (req, res) {
    var cmd = 'sortcl /RC'
    console.log(cmd)
    process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.json({ error:err })
        } else {
            let arr = []
            let lines = stderr.split("\n")
            var i
            for (i = 0; i < lines.length; ++i) {
                if (i < 6) {
                    continue
                }
                let val = lines[i].match("\\s*(\\w+)\\s+(\\w+)")
                if (val != null && val.length == 3) {
                    arr.push({
                        setting:val[1],
                        value:val[2]
                    })
                }
            }
            res.json(arr)
        }
    })
})

app.post('/loopback', function (req, res) {
    console.log(req.body)
    res.send(req.body)
})

app.get('/version', function (req, res) {
    var cmd = 'sortcl /V'
    console.log(cmd)
    process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.json({ error:err })
        } else {
            let lines = stdout.split("\n")
            //console.log(lines)
            let val1 = lines[0].match("(\\w+) ([\\d.]+) ([A-Z][\\d-]+) (\\w+) .*")
            let val2 = lines[1].match("([\\d-]{10} [\\d:]{8}) #([\\w\\.]+) .*")
            let val3 = lines[2].match(".*: ([\\d-]{10})")
            res.json(
                {   product:val1[1], 
                    version:val1[2], 
                    tag:val1[3], 
                    arch:val1[4], 
                    serial:val2[2],
                    expires:val3[1],
                    timestamp:val2[1] })
        }
    })
})

app.listen(port, () => console.log(`IRI RowGen web service at http://localhost:${port}`))
