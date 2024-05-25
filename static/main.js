$(document).ready(async function () {
  try {
    // Await the loading of each component
    await Promise.all([
      loadComponent("#header", "components/navbar.html"),
      loadComponent("#footer-container", "components/footer.html"),
    ]);
    // Get the current path
    const currentUrl = window.location.pathname;

    $(".nav-item a").each(function () {
      const linkUrl = $(this).attr("href");
      if (currentUrl === linkUrl) {
        $(this).parent("").addClass("active");
      }
    });
  } catch (error) {
    console.error("Error loading components: ", error);
  }
});

// Function to load a component and return a promise
async function loadComponent(selector, url) {
  return new Promise((resolve, reject) => {
    $(selector).load(url, function (response, status, xhr) {
      if (status == "error") {
        reject(xhr.status + " " + xhr.statusText);
      } else {
        resolve();
      }
    });
  });
}
