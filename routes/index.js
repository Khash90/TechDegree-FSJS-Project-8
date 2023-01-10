var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require('sequelize');



// Define results to be shown on each page
const resultsPerPage = 10;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req,res,next) => {
    try {
      await cb(req,res,next)
    }catch(error){
      res.status(500).send(error);
    }
  }
}



/* GET home page. */
router.get('/', (req, res) => {
  res.redirect("/books");
});

/* Show the full list books */
router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll({ order: [["createdAt", "DESC"]] });

  // Calculate the number of records in the dataset
  const count = books.length;

  // Display the first page of the dataset based on desired results per page
  const results = books.slice(0, resultsPerPage);
  res.render("index", {
    books: results,
    count,
    resultsPerPage,
  });
})
);

// GET records based on page to be displayed
router.get(
  "/page=:page",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll();

    // Extract page reference from params
    const page = req.params.page;

    // Extract length of dataset to display in DOM
    const count = books.length;

    // Calculate start and end indexes for splicing
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = resultsPerPage * page;

    // Slice array to display only the current page range
    const results = books.slice(startIndex, endIndex);

    if (results.length === 0) {
      // If the user alters the URL to a page without any content to display, redirect to 404 error page.
      res.redirect("page-not-found");
    } else {
      // Otherwise, render the results for the current page
      res.render("index", {
        books: results,
        count,
        resultsPerPage,
      });
    }
  })
);

//GET results from the search input and render results
router.get('/search', asyncHandler(async (req, res) => {
    // Destructure the query from the query object
    const { query } = req.query;
    // If there is no search query (blank submission), redirect to home and repopulate the book list.
    if (!query) {
      res.redirect("/");
    } else {
      // Else, search for books that match the query string
      const books = await Book.findAll({
        where: {
          [Op.or]: {
            title: {
              [Op.like]: `%${query}%`,
            },
            author: {
              [Op.like]: `%${query}%`,
            },
            genre: {
              [Op.like]: `%${query}%`,
            },
            year: {
              [Op.like]: `%${query}%`,
            },
          },
        },
      });

      // Render book list with search results
      res.render("index", { books, count: books.length });
    }
  })
);

/* Create new book */
router.get("/books/new", (req,res) => {
  res.render("new-book", {book: {}, title: "New Book "})
});

/*Posts a new book to the database*/
router.post("/books/new", asyncHandler( async(req,res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", {book, errors: error.errors , title: "New Book"})
    } else {
      throw error;
    }
  }
}))

/*Shows book detail form */
router.get("/books/:id", asyncHandler(async (req,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render("update-book", {book, title: book.title })
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Book Id Doesn't Exist"
    res.render("page-not-found", {title: "Page Not Found", err });
  }
}));

/*Updates book info in the database*/
router.post("/books/:id", asyncHandler(async(req,res) => {
  let book;
  try {
     book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/")
    } else {
      const err = new Error();
      err.status = 404;
      err.message = "Book Id Doesn't Exist"
      res.render("page-not-found", {title: "Page-Not-Found", err });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", {book, errors: error.errors, title: "New Book "})
    } else {
      res.sendStatus(404);
    }
  }
}));

/* Delete a book */

router.post("/books/:id/delete", asyncHandler(async(req,res) => {
  const book = await Book.findByPk(req.params.id)
  if(book) {
    await book.destroy();
    res.redirect("/");
  }else{
    const err = new Error();
    err.status = 404;
    err.message = "Book Id Doesn't Exist";
    res.render("page-not-found", {title: "Page-Not-Found", err });
  }
}));

module.exports = router;
