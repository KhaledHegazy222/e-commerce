const spreadsheetId = "1C87CSp86t5ZA4chnrBVGXvHiYK3VTg7GF2EJpGp4dOA";
const booksSheetName = "Books";
const sellersSheetName = "Sellers";
const apiKey = "AIzaSyD5hFsGNCUMsGSiMvE7chyGayUJ3bqBHLQ";
this.context = {};
this.context.books = [];
this.context.sellers = [];
this.context.cart = []


$(document).ready(async () => {
  booksPageDataPromise = fetchSheetPage(booksSheetName);
  sellersPageDataPromise = fetchSheetPage(sellersSheetName);
  const [booksResponse, sellersResponse] = await Promise.all([
    booksPageDataPromise,
    sellersPageDataPromise,
  ]);
  let books = [];
  let sellers = [];
  if (booksResponse.status === "success") {
    books = booksResponse.data.values;
    const booksHeaders = books[0];
    const booksData = books.slice(1);
    this.context.books = mapListToObj(booksHeaders, booksData);
    renderBooks();
  }
  if (sellersResponse.status === "success") {
    sellers = sellersResponse.data.values;
    const sellersHeaders = sellers[0];
    const sellersData = sellers.slice(1);
    this.context.sellers = mapListToObj(sellersHeaders, sellersData);
  }
});

async function fetchSheetPage(sheetName) {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`
    );
    return {
      status: "success",
      data: response.data,
      errors: null,
    };
  } catch (errors) {
    return {
      status: "failed",
      data: null,
      errors: errors,
    };
  }
}

function mapListToObj(headers, data) {
  return data.map((row) => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function constructBookCard(book) {
  // Create the main card div using jQuery
  const $card = $("<div>", { class: "card book-card" });

  // Create and set up the card image
  const $img = $("<img>", {
    class: "card-img-top",
    src: book.imageSrc,
    alt: "Card image cap",
  });

  // Create the card body div
  const $cardBody = $("<div>", { class: "card-body d-flex flex-column" });

  // Create and set up the card title
  const $cardTitle = $("<h5>", { class: "card-title h5", text: book.title });

  // Create and set up the card text
  const $cardText = $("<p>", {
    class: "card-text text-muted",
    text: book.description,
  });

  const isAlreadyAddedToCart = isInCart(book.title)
  let $cardButton;
  if (isAlreadyAddedToCart) {
    // Create and set up the card link/button
    $cardButton = $("<a>", {
      class: "btn btn-success d-block",
      text: "Remove From Cart",
    });
    $cardButton.click( () => removeItemFromCart(book.title))  
  }
  else {
    // Create and set up the card link/button
    $cardButton = $("<a>", {
      class: "btn btn-warning d-block",
      text: "Add To Cart",
    });
    $cardButton.click( () => addItemToCart(book.title))  
  }

  // Append elements to the card body
  $cardBody.append($cardTitle, $cardText, $cardButton);

  // Append image and card body to the main card div
  $card.append($img, $cardBody);

  return $card;
}

function renderBooks() {
  const booksDomElements = this.context.books.map((book) =>
    constructBookCard(book)
  );
  $("#main").empty();
  const $cardContainer = $("<div>", {
    class: "books-container d-flex justify-content-between gap-3 flex-wrap align-items-stretch",
  });
  $cardContainer.append(...booksDomElements);
  const $title = $("<h2>", {
    class: "page-title h2 display-4 fw-normal text-center",
  }).text("Available Books");
  const $description = $("<p>", {
    class: "page-description m-auto text-center text-muted fs-5",
    style:""
  }).text(
    "Browse our extensive book collection and find your next great read. From thrillers to classics, non-fiction to children's stories, there's something for everyone. Start your literary adventure today!"
  );
  $("#main").append($title, $description, $cardContainer);
}


function addItemToCart(bookTitle) {
  const book = this.context.books.find((elem) => elem.title === bookTitle)
  if (book === undefined) {
    showAlert("Something went wrong", "error")
    return;
  }
  this.context.cart.push(book)
  renderBooks()
  renderCart()
}



function removeItemFromCart(bookTitle) {
  const bookIndex = this.context.cart.findIndex((elem) => elem.title === bookTitle)
  if (bookIndex === -1) {
    showAlert("Something went wrong", "error")
    return;
  }
  this.context.cart.splice(bookIndex, 1)
  renderBooks()
  renderCart()
}


function isInCart(bookTitle) {
  const book = this.context.cart.find((elem) => elem.title === bookTitle)
  return book !== undefined;
}

function renderCart() {
  const cart = this.context.cart;
  const cartItemsList = cart.map((item) => {
    const $itemText = $("<p>", { text: item.title,class:"p-0 m-0" })
    const $removeBtn = $("<button>", {
      class:"bg-danger border-0 text-light",
      text: "x",
      style:"width:20px; height:20px; border-radius: 100%; display:grid; place-items:center;font-size: 0.9rem"
    })
    $removeBtn.click(() => {
      removeItemFromCart(item.title)
    })
    const $item = $("<li>", {
      class: "d-flex justify-content-between align-items-center mb-2",
    })
    $item.append($itemText,$removeBtn)
    return $item;
  })
  const $cartItemsList = $("<ul>")
  $cartItemsList.append(...cartItemsList)

  if (cart.length !== 0) {
    $(".cart-items").text(cart.length)
    $(".cart").removeClass("d-none")
    $("#checkoutModal .modal-body").html($cartItemsList)
  }
  else {
    $(".cart").addClass("d-none")
    $("#checkoutModal .modal-body").html($cartItemsList)
  }
}