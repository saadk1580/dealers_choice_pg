const pg = require("pg");
var axios = require("axios").default;
const client = new pg.Client("postgres://localhost/movie_db");
require("dotenv").config();

var options = {
  method: "GET",
  url: "https://imdb8.p.rapidapi.com/auto-complete",
  params: { q: "Harry Potter" },
  headers: {
    "x-rapidapi-host": "imdb8.p.rapidapi.com",
    "x-rapidapi-key": process.env.SECRET_API_KEY,
  },
};

const data = async () => {
  let getData;
  await axios
    .request(options)
    .then(function (response) {
      getData = response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
  return getData;
};

const syncAndSeed = async () => {
  const dataArr = await data();
  console.log(dataArr.d.map((item) => `${item.l.replace(/[^a-zA-Z ]/g, "")}`));
  const SQL = `
    DROP TABLE IF EXISTS movies;
    CREATE TABLE movies (
        id INTEGER,
        name VARCHAR(250),
        imgUrl VARCHAR(250),
        type VARCHAR(250),
        rank INTEGER,
        year INTEGER
    );
    ${dataArr.d
      .map(
        (item, idx) =>
          `INSERT INTO movies (id, name, imgUrl, type, rank, year)
       VALUES('${idx}', '${item.l.replace(/[^a-zA-Z ]/g, "")}', '${
            item.i.imageUrl
          }', '${item.q}', '${item.rank}', '${item.y}');`
      )
      .join("")}
   `;

  await client.query(SQL);
};

module.exports = {
  syncAndSeed,
  client,
};

// , '${
//     item.i.imageUrl
//   }', '${item.q}', ${item.rank}, ${item.y}

// ${idx}, '${item.l.replace(/[^a-zA-Z ]/g, "")}'

// ${dataArr.d.map(
//     (item, idx) =>
