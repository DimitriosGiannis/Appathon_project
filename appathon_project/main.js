const mysql = require('mysql');
const express = require ('express')
const app = express()
const bodyParser= require('body-parser')

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('./HTML'))

//establish connection 
function establish_connection (){
		return mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'covid-01'
})
}

const connection = establish_connection();

const query2 =  "SELECT DISTINCT title FROM metadata WHERE authors=? and "
 + "(title LIKE ? or abstract LIKE ?)"

function getTitles(author, dis) {
	return new Promise(function(resolve, reject) {
		connection.query(query2, [author, dis, dis], (err, rows) => {
			console.log(rows);
			resolve(rows);
	})
})
}
//request from browser
app.get('/top_authors', (req, res, next) => {
	const Squery = "SELECT authors, COUNT(authors) AS value_occurrence "
 + "FROM metadata WHERE title LIKE ? or abstract LIKE ? GROUP BY authors "
 + "ORDER BY value_occurrence DESC LIMIT 11"

console.log("Searching top authors...")
const dis='%' + req.query.disease + '%'
connection.query(Squery, [dis, dis], (err,rows,fields) =>{
	console.log(rows.length);
	req.authors = rows;
	next();	
})

},	async (req,res) => {
console.log("Searching top authors...")
const dis='%' + req.query.disease + '%'
console.log(dis);
 
const rows = req.authors;
for (var row=0; row < rows.length; row++){
	var author = rows[row].authors;
	await getTitles(author, dis)
	.then(function(results){
	var titles = [];
	for (var i=0; i<results.length; i++)
		titles.push(results[i].title)
	rows[row].titles = titles;
	})
	.catch(err => {throw err; })
}
console.log(rows);
res.json(rows);
})

//localhost:3003
app.listen(3003, () => {
	console.log("Server is up and listening on 3003...")
})

