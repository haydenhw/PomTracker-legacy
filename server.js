const express = require('express');
const app = express();
const bp = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;


app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
app.use(express.static('public'))

let db, server;

app.get('/getData', (req, res) => {
	db.collection('projects').find().toArray(
		function(err, results){
			res.send(results);
		});
});

app.post('/save', (req, res) => {
	console.log(req.body);
	db.collection('projects').save(req.body, (err, result) => {
		if (err) return console.log(err);
		console.log('saved to database');
		res.redirect('/')
	});
});

app.put('/update', (req, res) => {
	db.collection('projects')
	.findOneAndUpdate({name : req.body.name}, {
		$set: {
			name: req.body.name,
			parent: req.body.parent,
			total: req.body.total
		}
	}, (err, result) => {
		if(err) console.log(err);
		res.send(result);
		//console.log('Save Successful');
	});
});

app.delete('/delete', (req,res) => {
	console.log(req.body.name);
	console.log(req.body);
	db.collection('projects').findOneAndDelete({name : req.body.name},
	 (err, result) => {
		console.log(result, 'deleted');
		db.collection('projects').find().toArray(
		function(err, results){
			//console.log(results);
		});
	});
});

MongoClient.connect('mongodb://hayden321:46869269a@ds127878.mlab.com:27878/pomtimer', (err, database) => {
	if (err) return console.log(err);
	db = database;
	server = app.listen(process.env.PORT || 3000, () => {
		console.log("Listening on port 3000");
	});

});
