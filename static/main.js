$(document).ready(() => {
  // Get the current path
  const currentUrl = window.location.pathname;
  $(".nav-item a").each(function () {
    const linkUrl = $(this).attr("href");
    if (currentUrl === linkUrl) {
      $(this).parent("").addClass("active");
    }
  });
});
