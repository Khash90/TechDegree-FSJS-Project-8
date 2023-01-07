var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

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
  res.render('index', { books });
}));


/* Create new book */
router.get("/books/new", (req,res) => {
  res.render("new-book", {book: {}, title: "New Book "})
});

/*Posts a new book to the database*/
router.post("/new", asyncHandler(async(req,res) => {
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
router.get("/:id", asyncHandler(async (req,res) => {
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
router.post("/:id", asyncHandler(async(req,res) => {
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
    if (error.name === "SequelizeValidationErrors") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", {book, errors: error.errors, title: "New Book "})
    } else {
      res.sendStatus(404);
    }
  }
}));

/* Delete a book */

router.post("/:id/delete", asyncHandler(async(req,res) => {
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
