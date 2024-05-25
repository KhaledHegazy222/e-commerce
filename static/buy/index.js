const spreadsheetId = "1C87CSp86t5ZA4chnrBVGXvHiYK3VTg7GF2EJpGp4dOA";
const booksSheetName = "Books";
const sellersSheetName = "Sellers";
const apiKey = "AIzaSyD5hFsGNCUMsGSiMvE7chyGayUJ3bqBHLQ";

let books = [];
let sellers = [];

$(document).ready(async function () {
  booksPageDataPromise = fetchSheetPage(booksSheetName);
  sellersPageDataPromise = fetchSheetPage(sellersSheetName);
  const [booksResponse, sellersResponse] = await Promise.all([
    booksPageDataPromise,
    sellersPageDataPromise,
  ]);
  let booksSheet = [];
  let sellersSheet = [];
  if (booksResponse.status === "success") {
    booksSheet = booksResponse.data.values;
  }
  if (sellersResponse.status === "success") {
    sellersSheet = sellersResponse.data.values;
  }
  const booksHeaders = booksSheet[0];
  const booksData = booksSheet.slice(1);
  const sellersHeaders = sellersSheet[0];
  const sellersData = sellersSheet.slice(1);
  books = mapListToObj(booksHeaders, booksData);
  sellers = mapListToObj(sellersHeaders, sellersData);
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
