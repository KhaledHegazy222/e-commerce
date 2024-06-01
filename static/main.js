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



function showAlert(message, type) {
  const alertTypeClasses = {
    "success":"alert-success",
    "error": "alert-danger",
  }
    // Create the alert div
  const $alert = $("<div>", {
    class: `alert ${alertTypeClasses[type]} alert-dismissible`,
    role: "alert",
  }).text(message);

  // Create the close button
  const $closeButton = $("<button>", {
    type: "button",
    class: "btn-close",
    "data-bs-dismiss": "alert",
    "aria-label": "Close"
  });

  // Append the close button to the alert div
  $alert.append($closeButton);

  // Append the alert to the container (for example, body or a specific div)
  $("main").prepend($alert); // Change "body" to your specific container
  
}