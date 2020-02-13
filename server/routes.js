var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */


/* ---- Q1a (Dashboard) ---- */
function getAllGenres(req, res) {
  var query = `
    SELECT DISTINCT genre
    FROM Genres;
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
};



/* ---- Q1b (Dashboard) ---- */
function getTopInGenre(req, res) {
  var inputGenre = req.params.genre;
  var query = `
    SELECT DISTINCT m.title as title, m.rating as rating, m.vote_count as vote_count
    FROM Movies m
    INNER JOIN Genres g
    ON m.id = g.movie_id
    WHERE g.genre = '${inputGenre}'
    ORDER BY rating DESC, vote_count DESC
    LIMIT 10;
  `;

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
};

/* ---- Q2 (Recommendations) ---- */
function getRecs(req, res) {
  var inputMovie = req.params.movie;
  // console.log(inputMovie);
  var query = `
    WITH checkGenres AS (
    	SELECT DISTINCT g.genre AS genres
    	FROM Movies m
    	INNER JOIN Genres g
    	ON g.movie_id = m.id
    	WHERE m.title = '${inputMovie}'
    )

    SELECT m.title AS title, m.id AS id, m.rating AS rating, m.vote_count AS vote_count
    FROM Movies m
    INNER JOIN Genres g
    ON g.movie_id = m.id
    INNER JOIN checkGenres
    ON checkGenres.genres = g.genre
    GROUP BY m.id
    HAVING COUNT(g.genre) = 
    (SELECT COUNT(DISTINCT g.genre)
    FROM Movies m
    INNER JOIN Genres g
    ON g.movie_id = m.id
    WHERE m.title = '${inputMovie}') AND m.title != '${inputMovie}'
    ORDER BY m.rating DESC, m.vote_count DESC
    LIMIT 5;
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
};

/* ---- (Best Genres) ---- */
function getDecades(req, res) {
	var query = `
    SELECT DISTINCT (FLOOR(year/10)*10) AS decade
    FROM (
      SELECT DISTINCT release_year as year
      FROM Movies
      ORDER BY release_year
    ) y
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

/* ---- Q3 (Best Genres) ---- */
function bestGenresPerDecade(req, res) {

};

// The exported functions, which can be accessed in index.js.
module.exports = {
	getAllGenres: getAllGenres,
	getTopInGenre: getTopInGenre,
	getRecs: getRecs,
	getDecades: getDecades,
  bestGenresPerDecade: bestGenresPerDecade
}