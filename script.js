// Function to get query parameters from the URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    amount: params.get("amount"), // Payment amount (e.g., "1.00")
    currency: params.get("currency"), // Currency code (e.g., "QAR")
    description: params.get("description"), // Payment description
    userID: params.get("userID"), // User identifier
    customerID: params.get("customerID"), // Customer ID
    membershipID: params.get("membershipID"), // Membership ID
    redirectUrl: params.get("redirectUrl"), // URL after payment is processed
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

    // Prepare the payload for Dibsy API
    const payload = {
      amount: {
        value: paymentDetails.amount, // Payment amount (e.g., "1.00")
        currency: paymentDetails.currency, // Currency code (e.g., "QAR")
      },
      description: paymentDetails.description, // Payment description
      method: "creditcard", // Payment method
      sequenceType: "recurring", // Sequence type
      cardToken: token, // Dibsy token
      customerId: paymentDetails.customerID, // Customer ID
      redirectUrl: paymentDetails.redirectUrl, // Redirect URL after payment processing
      webhookUrl: "https://hook.eu1.make.com/zuq5j7v25yoeqgx5snkevxyax1mp1wsa", // Webhook URL
      metadata: {
        userID: paymentDetails.userID, // Metadata: User ID
        membershipID: paymentDetails.membershipID, // Metadata: Membership ID
      },
    };

    // Call Dibsy's Create Payment API
    fetch("https://api.dibsy.dev/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_SECRET_KEY", // Replace with your Dibsy secret key
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json()) // Parse JSON response
      .then((data) => {
        if (data._links && data._links.checkout) {
          // Redirect the user to the 3DS page
          console.log("Redirecting to 3DS:", data._links.checkout);
          window.location.href = data._links.checkout;
        } else {
          console.log("Payment processed without 3DS:", data);
          // Optionally redirect the user to the post-payment URL
          window.location.href = paymentDetails.redirectUrl;
        }
      })
      .catch((error) => {
        console.error("Error processing payment:", error);
        formError.textContent = "An error occurred while processing the payment.";
      });

    enableForm(); // Re-enable the form after sending
  });
});

function disableForm() {
  submitButton.disabled = true;
}

function enableForm() {
  submitButton.disabled = false;
}
