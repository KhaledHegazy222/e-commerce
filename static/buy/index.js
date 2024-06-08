const spreadsheetId = "1C87CSp86t5ZA4chnrBVGXvHiYK3VTg7GF2EJpGp4dOA";
const booksSheetName = "Books";
const sellersSheetName = "Sellers";
const apiKey = "AIzaSyD5hFsGNCUMsGSiMvE7chyGayUJ3bqBHLQ";
this.context = {};
this.context.books = [];
this.context.sellers = [];
this.context.cart = [];

$(document).ready(async () => {
  let booksPageDataPromise;
  let sellersPageDataPromise;

  if (localStorage.getItem("books") && localStorage.getItem("sellers")) {
    this.context.books = JSON.parse(localStorage.getItem("books"));
    this.context.sellers = JSON.parse(localStorage.getItem("sellers"));
  } else {
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
      localStorage.setItem("books",JSON.stringify(this.context.books))
    }
    if (sellersResponse.status === "success") {
      sellers = sellersResponse.data.values;
      const sellersHeaders = sellers[0];
      const sellersData = sellers.slice(1);
      this.context.sellers = mapListToObj(sellersHeaders, sellersData);
      localStorage.setItem("sellers",JSON.stringify(this.context.sellers))
    }
  }
  assignBooksToAuthors();
  renderBooks();
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
    headers
      .map((header) => header.toLowerCase().replace(" ", "_"))
      .forEach((header, index) => {
        obj.id = crypto.randomUUID()
        obj[header] = row[index];
      });
    return obj;
  });
}

function constructBookCard(book) {
  
  // Create the main card div using jQuery
  const $card = $("<div>", { class: "card book-card position-relative" });

  // Create and set up the card image
  const $img = $("<img>", {
    class: "card-img-top",
    src: book.image,
    alt: "Card image cap",
  });

  // Create the card body div
  const $cardBody = $("<div>", { class: "card-body d-flex flex-column" });

  // Create and set up the card title
  const $cardTitle = $("<h5>", { class: "card-title h5", text: book.title });

  // Create and set up the card text
  const $cardText = $("<div>", {
    class: "card-text text-muted",
    html: `
      <p data-bs-toggle="tooltip" data-bs-placement="bottom" title="${
        book.description
      }">
      ${getFirstNChar(book.description, 100)}
      </p>
    `,
  });
  
  const isAlreadyAddedToCart = isInCart(book.title);
  let $cardButton;
  if (isAlreadyAddedToCart) {
    // Create and set up the card link/button
    $cardButton = $("<a>", {
      class: "btn btn-success d-block",
      text: "Remove From Cart",
    });
    $cardButton.click(() => removeItemFromCart(book.title));
  } else {
    
    // Create and set up the card link/button
    $cardButton = $("<a>", {
      class: "btn btn-warning d-block",
      text: "Add To Cart",
    });
    $cardButton.click(() => addItemToCart(book.title));
  }

  // Append elements to the card body
  $cardBody.append($cardTitle, $cardText, $cardButton);

  // Append image and card body to the main card div
  $card.append($img, $cardBody);

  const haveAddedSellerToCart = isSellerInCart(book.seller_id)
  const $discountLabel = $("<span>", {
    html: 'Discount applied <i class="bi bi-info-circle"></i>',
    class: "discount-label position-absolute",
  })
  $discountLabel.attr("data-bs-toggle","tooltip")
  $discountLabel.attr("data-bs-placement","bottom")
  $discountLabel.attr("title","No delivery fees will be applied on this book as it is from the same seller in your cart")
  if (haveAddedSellerToCart && !isAlreadyAddedToCart) {
    $card.append($discountLabel)
  }

  return $card;
}

function assignBooksToAuthors() {
  this.context.books = this.context.books.map(book => {
    const bookSellerPhoneNumber = book.phone_number
    seller = this.context.sellers.find((seller) => seller.phone_number == bookSellerPhoneNumber)
    if (seller === undefined) {
        book.seller_id = crypto.randomUUID()
    }
    else {
      book.seller_id = seller.id
    }
    return book

  })
}

function renderBooks() {
  const booksDomElements = this.context.books.map((book) =>
    constructBookCard(book)
  );
  $("#main").empty();
  const $cardContainer = $("<div>", {
    class:
      "books-container d-flex justify-content-between gap-3 flex-wrap align-items-stretch",
  });
  $cardContainer.append(...booksDomElements);
  const $title = $("<h2>", {
    class: "page-title h2 display-4 fw-normal text-center",
  }).text("Available Books");
  const $description = $("<p>", {
    class: "page-description m-auto text-center text-muted fs-5",
    style: "",
  }).text(
    "Browse our extensive book collection and find your next great read. From thrillers to classics, non-fiction to children's stories, there's something for everyone. Start your literary adventure today!"
  );
  $("#main").append($title, $description, $cardContainer);
  $('[data-bs-toggle="tooltip"]').tooltip();
}

function addItemToCart(bookTitle) {
  const book = this.context.books.find((elem) => elem.title === bookTitle);
  if (book === undefined) {
    showAlert("Something went wrong", "error");
    return;
  }
  this.context.cart.push(book);
  renderBooks();
  renderCart();
}

function removeItemFromCart(bookTitle) {
  const bookIndex = this.context.cart.findIndex(
    (elem) => elem.title === bookTitle
  );
  if (bookIndex === -1) {
    showAlert("Something went wrong", "error");
    return;
  }
  this.context.cart.splice(bookIndex, 1);
  renderBooks();
  renderCart();
}

function isInCart(bookTitle) {
  const book = this.context.cart.find((elem) => elem.title === bookTitle);
  return book !== undefined;
}

function renderCart() {
  const cart = this.context.cart;
  const cartItemsList = cart.map((item) => {
    const $itemImage = $("<img>", {
      src: item.image,
      style: "width:150px; height:100px; object-fit: cover;",
      class: "rounded",
    });
    const $itemText = $("<div>", {
      class: "p-2 m-0 d-flex flex-column",
      style: "flex: 1; align-self: stretch;",
      html: `
      <h5 class='p-0 m-0 h5'>${item.title}</h5>
      <p class='p-0 m-0 text-muted small' data-bs-toggle="tooltip" data-bs-placement="bottom" title="${
        item.description
      }">
      ${getFirstNChar(item.description, 100)}
      </p>
      <p class='p-0 m-0 text-end mt-auto'>Cost: <span class='fw-bold'>${40} EGP</span></p>
      `,
    });
    const $removeBtn = $("<button>", {
      class: "remove-btn border-0",
      style: "font-size: 2rem",
    });
    $removeBtn.append($("<i class='bi bi-x'></i>"));
    $removeBtn.click(() => {
      removeItemFromCart(item.title);
    });
    const $item = $("<li>", {
      class:
        "d-flex justify-content-between align-items-center my-3 gap-2 border rounded",
    });
    $item.append($itemImage, $itemText, $removeBtn);
    return $item;
  });
  const $cartItemsList = $("<ul>", { class: "m-0 p-0" });
  $cartItemsList.append(...cartItemsList);
  const $totalCost = $("#total-cost-content");
  $totalCost.text(`${(Math.random() * 100 + 11).toFixed(2)} EGP`);

  if (cart.length !== 0) {
    $(".cart-items").text(cart.length);
    $(".cart").removeClass("d-none");
    $("#checkoutModal .modal-body").html($cartItemsList);
  } else {
    $(".cart").addClass("d-none");
    $("#checkoutModal .modal-body").html($cartItemsList);
  }
  $('[data-bs-toggle="tooltip"]').tooltip();
}

function getFirstNChar(str, len) {
  if (str.length > len) {
    return str.slice(0, len) + "...";
  }
  return str;
}

function sendWhatsApp() {
  const phoneNumber = "+201282137600";
  let textMessage = "Order:";
  textMessage += this.context.cart.reduce(
    (message, item) => message + `\r\n\t- ${item.title}`,
    ""
  );
  const whatsAppUrl = `https://wa.me/${phoneNumber}?text=${textMessage}`;
  window.open(whatsAppUrl, "_blank");
}
function isSellerInCart(seller_id) {
    return this.context.cart.find(item=>item.seller_id === seller_id) !== undefined
}