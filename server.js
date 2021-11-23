const express = require("express");
const morgan = require("morgan");
const { syncAndSeed, client } = require("./db");
const chalk = require("chalk");

const app = express();

app.use(morgan("dev"));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res, next) => {
  res.redirect("/movies");
});

let movies;
app.get("/movies", async (req, res, next) => {
  try {
    const SQL = `
      SELECT *
      FROM movies;
    `;
    const response = await client.query(SQL);
    movies = response.rows;
    res.send(`
    <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <div class="movie-container">
            ${movies
              .map(
                (movie) => `
              <div class='movie'>
                <a href="/movies/${movie.id}">
                  <img class='movie-img' src='${movie.imgurl}'/>
                  <h3 class='title'>${movie.name}</h3>
                </a>
              </div>
            `
              )
              .join("")}
          </div>
        </body>
      </html>
`);
  } catch (ex) {
    next(ex);
  }
});

app.get("/movies/:id", async (req, res, next) => {
  try {
    const movie = await movies[req.params.id];
    res.send(`
        <!DOCTYPE html>
          <html>
            <head>
              <link rel="stylesheet" href="/style.css" />
            </head>
            <body>
              <div class="backBtn">
                <a href="/"> Back 
                </a>
              </div>

              <div class="movie-container">
                  <div class='movie'>
                    <img class='movie-img' src='${movie.imgurl}'/>
                    <h3 class='title'>${movie.name}</h3>
                    <p> Type: ${movie.type}
                    <p> Rank: ${movie.rank}</p>
                    <p> Release Year: ${movie.year}</p>
                  </div>
              </div>
            </body>
          </html>
      `);
  } catch (err) {
    next(err);
  }
});

const bootstrap = async () => {
  try {
    await client.connect();
    await syncAndSeed();
    console.log("seeded");
    const PORT = 3000;
    await app.listen(PORT, () => {
      console.log(`App listening in port ${PORT}`);
    });
  } catch (ex) {
    console.log(chalk.whiteBright.bold(ex));
  }
};

bootstrap();
