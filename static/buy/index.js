const spreadsheetId = "1C87CSp86t5ZA4chnrBVGXvHiYK3VTg7GF2EJpGp4dOA";
const booksSheetName = "Books";
const sellersSheetName = "Sellers";
const apiKey = "AIzaSyD5hFsGNCUMsGSiMvE7chyGayUJ3bqBHLQ";
this.context = {};
this.context.books = [];
this.context.sellers = [];

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
  const $card = $("<div>", { class: "card book-card", style: "width: 18rem;" });

  // Create and set up the card image
  const $img = $("<img>", {
    class: "card-img-top",
    src: book.imageSrc,
    alt: "Card image cap",
    style: "height:200px; object-fit: cover;",
  });

  // Create the card body div
  const $cardBody = $("<div>", { class: "card-body" });

  // Create and set up the card title
  const $cardTitle = $("<h5>", { class: "card-title h5", text: book.title });

  // Create and set up the card text
  const $cardText = $("<p>", {
    class: "card-text text-muted",
    text: book.description,
  });

  // Create and set up the card link/button
  const $cardButton = $("<a>", {
    class: "btn btn-warning d-block",
    href: book.link,
    text: "Add To Cart",
  });

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
    class: "d-flex justify-content-between gap-3 flex-wrap books-container",
  });
  $cardContainer.append(...booksDomElements);
  const $title = $("<h2>", {
    class: "h2 display-4 fw-normal text-center",
    style:"margin: 1.5rem 0;"
  }).text("Available Books");
  const $description = $("<p>", {
    class: "m-auto text-center text-muted fs-5",
    style:"max-width:80%; margin: 1.5rem 0;"
  }).text(
    "Browse our extensive book collection and find your next great read. From thrillers to classics, non-fiction to children's stories, there's something for everyone. Start your literary adventure today!"
  );
  $("#main").append($title, $description, $cardContainer);
}
