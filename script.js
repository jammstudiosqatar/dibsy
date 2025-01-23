// Function to get query parameters from the URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    amount: params.get("amount"), // Payment amount (e.g., 10000 for $100.00)
    currency: params.get("currency"), // Currency (e.g., USD)
    description: params.get("description"), // Payment description
    userID: params.get("userID"), // Optional user identifier
    customerID: params.get("customerID"),
    membershipID: params.get("membershipID"),
    redirectUrl: params.get("redirectUrl"),
    payMethodID: params.get("payMethodID"),
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
  cardNumberError.textContent = event.error && event.touched ? event.error : "";
});

var expiryDateError = document.getElementById("expiry-date-error");
expiryDate.addEventListener("change", function (event) {
  expiryDateError.textContent =
    event.error && event.touched ? event.error : "";
});

var verificationCodeError = document.getElementById("verification-code-error");
verificationCode.addEventListener("change", function (event) {
  verificationCodeError.textContent =
    event.error && event.touched ? event.error : "";
});

/**
 * Submit handler
 */
var form = document.getElementById("payForm");
var formError = document.getElementById("form-error");
var submitButton = document.getElementById("submit-button");

form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission
  disableForm(); // Disable the form while processing
  formError.textContent = ""; // Reset any previous errors

  // Get a payment token
  dibsy.cardToken().then(function (result) {
    const token = result.token; // Dibsy token
    const error = result.error;

    if (error) {
      enableForm(); // Re-enable the form on error
      formError.textContent = error.message;
      return;
    }

    console.log("Token:", token);

    // Send token and payment details to Make.com
    fetch("https://hook.eu1.make.com/zuq5j7v25yoeqgx5snkevxyax1mp1wsa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token, // Dibsy token
        amount: paymentDetails.amount, // Payment amount
        currency: paymentDetails.currency, // Payment currency
        description: paymentDetails.description, // Payment description
        userID: paymentDetails.userID, // User ID
        customerID: paymentDetails.customerID,
        membershipID: paymentDetails.membershipID,
        redirectUrl: paymentDetails.redirectUrl,
        payMethodID: paymentDetails.payMethodID,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Payment data sent to Make.com successfully!");
        } else {
          console.error("Failed to send payment data to Make.com.");
        }
      })
      .catch((error) => console.error("Error sending payment data:", error));

       enableForm(); // Re-enable the form after sending
  });
});

function disableForm() {
  submitButton.disabled = true;
}

function enableForm() {
  submitButton.disabled = false;
}
