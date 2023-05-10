import React from "react";
import ReactDOM from "react-dom";
import './index.css'

const books = [
  { 
    id: 1,
    img: "https://m.media-amazon.com/images/I/612p+obHYUL._AC_UL320_.jpg",
    title: "On the March",
    author: "Trudy Krisher",
  },
  
  { 
    id: 2,
    img: "https://m.media-amazon.com/images/I/612p+obHYUL._AC_UL320_.jpg",
    title: "On the March",
    author: "Trudy Krisher",
  }
]

function Booklist () {
  return ( 
    <section className="booklist">
    {books.map((book, index) => {
      return <Book key={book.id} {...book}></Book>;
    })}
  </section>
  );
}

const Book = ({ img, title, author }) => {
  // We can set up events in our project, To create events, we need the attribute and eventHandler, 
  // We will use onClick and onMouseOver events 
  return (
    <article className="book">
      <img src= {img} alt='' />
      <h1>{title}</h1>
      <h4>{author.toUpperCase()}</h4>
    </article>
  )
}

ReactDOM.render(<Booklist />, document.getElementById('root'));

/* 
const firstBooks = [
  {
    img: "https://m.media-amazon.com/images/I/612p+obHYUL._AC_UL320_.jpg",
    title: "On the March",
    author: "Trudy Krisher",
  };

function booklist = {
  <section className = "booklist">
  <Book
    img={fistbook.img}
    titke={fistbook.title}
    author={fistbook.author}
  >
  <p>This is my book</p>
  </Book>
}

// We may include children just like the <p> tag above into the block below. What we can do is to include "prop"
const Book = ( {img, title, author, children } ) => {
  return (
    <article className="book">
      <img src= {img} alt='' />
      <h1>{title}</h1>
      {children}
      <h4>{author.toUpperCase()}</h4>
    </article>
  )
}
*/ // OR

