// Function to get query parameters from the URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    amount: params.get("amount"), // Payment amount (e.g., 10000 for $100.00)
    currency: params.get("currency"), // Currency (e.g., USD)
    description: params.get("description"), // Payment description
    userID: params.get("userID"), // Optional user identifier
  };
}

// Extract payment details from the URL
const paymentDetails = getQueryParams();

// Log the payment details for debugging (optional)
console.log("Payment Details:", paymentDetails);

var options = {
  styles: {
    fontSize: "16px",
    color: "rgba(0, 0, 0, 0.8)",
    backgroundColor: "transparent",
    "&.is-invalid": {
      color: "#f42828",
    },
  },
};

const dibsy = Dibsy("pk_test_q0ch38qc4I7njWnUUSSF8G5thPw0tTFt4uTH", {
  locale: "en_US",
});
var cardNumber = dibsy.createComponent("cardNumber", options);
cardNumber.mount("#card-number");

var expiryDate = dibsy.createComponent("expiryDate", options);
expiryDate.mount("#expiry-date");

var verificationCode = dibsy.createComponent("verificationCode", options);
verificationCode.mount("#verification-code");

var cardNumberError = document.getElementById("card-number-error");
cardNumber.addEventListener("change", function (event) {
  if (event.error && event.touched) {
    cardNumberError.textContent = event.error;
  } else {
    cardNumberError.textContent = "";
  }
});

var expiryDateError = document.getElementById("expiry-date-error");
expiryDate.addEventListener("change", function (event) {
  if (event.error && event.touched) {
    expiryDateError.textContent = event.error;
  } else {
    expiryDateError.textContent = "";
  }
});

//

var verificationCodeError = document.getElementById("verification-code-error");
verificationCode.addEventListener("change", function (event) {
  if (event.error && event.touched) {
    verificationCodeError.textContent = event.error;
  } else {
    verificationCodeError.textContent = "";
  }
});

/**
 * Submit handler
 */

var form = document.getElementById("payForm");
var formError = document.getElementById("form-error");
var submitButton = document.getElementById("submit-button");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  disableForm();

  // Reset possible form error
  formError.textContent = "";

  // Get a payment token

  dibsy.cardToken().then(function (result) {
    var token = result.token;
    var error = result.error;

    if (error) {
      enableForm();
      formError.textContent = error.message;
      return;
    }

    console.log("Token:", token);

    // Add token to the form
    // var tokenInput = document.createElement("input");
    // tokenInput.setAttribute("name", "token");
    // tokenInput.setAttribute("type", "hidden");
    // tokenInput.setAttribute("value", token);

    // form.appendChild(tokenInput);

    // Re-submit form to the server
    //form.submit();
  });
});

function disableForm() {
  submitButton.disabled = true;
}

/**
 * Enables the form inputs and submit button
 */
function enableForm() {
  submitButton.disabled = false;
}
