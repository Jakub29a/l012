const express = require("express")
var app = express()
const PORT = process.env.PORT;

var path = require("path");
var hbs = require('express-handlebars');

const Datastore = require('nedb')
const carsdb = new Datastore({
    filename: 'cars.db',
    autoload: true
});

app.set('views', path.join(__dirname, 'views'));


app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {
        ynn: function (title) {
            let te = ["NIE", "TAK", "BRAK"];
            return te[title];
        },
        eq: function (a, b) {
            return a == b;
        }
    }
}));


app.set('view engine', 'hbs');




app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});

app.use(express.urlencoded({
    extended: true
}));

function renres(res, edit, conadd) {
    carsdb.find({}, function (err, docs) {
        console.log("----- tablica obiektów pobrana z bazy: \n")
        console.log(docs)
        if (edit) docs.forEach(a => a.editable = true);
        let con = {
            editable: edit,
            cars: docs,
            edid: conadd
        }
        console.log(con);
        res.render('index.hbs', con);
    });
}

function renderResponse(res, edit) {
    renres(res, edit, "");
}

app.get("/", function (req, res) {
    renderResponse(res, true);
});
app.get("/editable", function (req, res) {
    renderResponse(res, true);
});

app.post("/add", function (req, res) {
    let doc = {
        ins: (req.body.ins ? 1 : 0),
        fuel: (req.body.fuel ? 1 : 0),
        dmg: (req.body.dmg ? 1 : 0),
        d44: (req.body.d44 ? 1 : 0)
    }
    carsdb.insert(doc, function (err, newDoc) {
        console.log("dodano dokument (obiekt):");
        console.log(newDoc);
        renderResponse(res, true);
    });
});

app.post("/delete", function (req, res) {
    carsdb.remove({ _id: req.body.id }, {}, function (err, numRem) {
        renderResponse(res, true);
    });
});

app.post("/inedit", function (req, res) {
    renres(res, true, req.body.id);
});

app.post("/commit", function (req, res) {

    carsdb.update({ _id: req.body.hid }, {
        $set: {
            ins: req.body.ins,
            fuel: req.body.fuel,
            dmg: req.body.dmg,
            d44: req.body.d44
        }
    }, {}, function (err, numUp) {
        renderResponse(res, true);
    }
    );

});

app.use(express.static('static'));
