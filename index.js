import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "1234",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


let total;

app.get("/", async (req, res) => {
  let data;
  const query = "SELECT country_code FROM visited_countries";
  let results = await new Promise ((resolve, reject)=>{
    db.query(query, (err, queryRes)=>{
      if (err){
        console.log("Error executing query", err.stack);
        reject(err);
      }
      resolve(queryRes.rows);
    });
  });
  data = visitedCountries(results)
  total = results.length;
  res.render("index.ejs", {countries: data, total: total})
});

app.post("/add", async(req, res)=>{
  const country = req.body.country;
  const query = "SELECT country_code FROM countries WHERE country_name = $1";
  let queryResult = await db.query(query, [country]);
  queryResult = queryResult.rows[0].country_code;
  const insertQuery = "INSERT INTO visited_countries (country_code) VALUES ($1)";
  await db.query(insertQuery, [queryResult]);
  res.status(200).redirect("/");
});

const visitedCountries = (data)=>{
  let countries="";
  for (let i=0; i< data.length; i++){
      if (i!=data.length-1){
        countries+=data[i].country_code+ ",";
      } else{
        countries+=data[i].country_code
      }
    }
    return countries;
  }

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
