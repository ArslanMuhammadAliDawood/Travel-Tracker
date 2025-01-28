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
let data;
app.get("/", async (req, res) => {
  const result = await fetchVistedCountries();
  data = result.data;
  total = result.total;
  res.status(200).render("index.ejs", {countries: data, total: total})
});

app.post("/add", async(req, res)=>{
    const country = req.body.country;
    let queryResult; 
      try{
        const query = "SELECT country_code FROM countries WHERE country_name LIKE $1";
        queryResult = await db.query(query, [`%${country}%`]);
        queryResult = queryResult.rows[0].country_code;
      }catch(err){
        console.log(err);
        const result = await fetchVistedCountries();
        data = result.data;
        total = result.total;
        res.status(404).render("index.ejs", {total:total, countries:data, error:"Country does not exist. Try Again"});
        return;
      }
      try{
        const insertQuery = "INSERT INTO visited_countries (country_code) VALUES ($1)";
        await db.query(insertQuery, [queryResult]);

      }catch(err){
        console.log(err);
        const result = await fetchVistedCountries();
        data = result.data;
        total = result.total;
        res.status(404).render("index.ejs", {total:total, countries:data, error:"Country already visited. Try Again"});
        return;
      }
      res.status(200).redirect("/");
});

const fetchVistedCountries = async() =>{
  const query = "SELECT country_code FROM visited_countries";
  const results = await db.query(query);
  data = visitedCountries(results.rows);
  total = results.rows.length;
  return { data, total };
}
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
