// Get query parameters from the URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    userID: params.get("userID"),
    customerID: params.get("customerID"),
    redirectUrl: params.get("redirectUrl"),
    customerName: params.get("customerName"),
  };
}

// Extract and log query data
const setupDetails = getQueryParams();
console.log("Card Setup Details:", setupDetails);

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

// Initialize Dibsy components
const dibsy = Dibsy("pk_test_q0ch38qc4I7njWnUUSSF8G5thPw0tTFt4uTH", {
  locale: "en_US",
});
var cardNumber = dibsy.createComponent("cardNumber", options);
cardNumber.mount("#card-number");

var expiryDate = dibsy.createComponent("expiryDate", options);
expiryDate.mount("#expiry-date");

var verificationCode = dibsy.createComponent("verificationCode", options);
verificationCode.mount("#verification-code");

// Attach validation display
cardNumber.addEventListener("change", (event) => {
  document.getElementById("card-number-error").textContent =
    event.error && event.touched ? event.error : "";
});
expiryDate.addEventListener("change", (event) => {
  document.getElementById("expiry-date-error").textContent =
    event.error && event.touched ? event.error : "";
});
verificationCode.addEventListener("change", (event) => {
  document.getElementById("verification-code-error").textContent =
    event.error && event.touched ? event.error : "";
});

// Submit logic
const form = document.getElementById("cardForm");
const formError = document.getElementById("form-error");
const submitButton = document.getElementById("submit-button");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  disableForm();
  formError.textContent = "";

  dibsy.cardToken().then(function (result) {
    const token = result.token;
    const error = result.error;

    if (error) {
      enableForm();
      formError.textContent = error.message;
      return;
    }

    console.log("Token:", token);

    // Prepare payload for Make.com
    const payload = {
      token: token,
      amount: "100", // 1 QAR in minor units (e.g. 100 dirhams)
      currency: "QAR",
      userID: setupDetails.userID,
      customerID: setupDetails.customerID,
      customerName: setupDetails.customerName,
      redirectUrl: setupDetails.redirectUrl,
      action: "verify_card",
    };

    fetch("https://hook.eu1.make.com/0u827q8wznlwcxjn9lexb02as79su5ks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Make.com Response:", data);
        if (data && data.checkout_url) {
          window.location.href = data.checkout_url;

          // Handle final result after 3DS
          window.addEventListener("message", (event) => {
            if (event.origin === "https://dibsy.com") {
              const result = event.data;
              console.log("Card Verification Result:", result);

              if (result === "success") {
                window.location.href = setupDetails.redirectUrl || "/success.html";
              } else {
                document.body.innerHTML = "<h1>Card verification failed.</h1>";
              }
            }
          });
        } else {
          formError.textContent = "Unable to process card setup.";
          enableForm();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        formError.textContent = "An error occurred while processing the card.";
        enableForm();
      });
  });
});

function disableForm() {
  submitButton.disabled = true;
}

function enableForm() {
  submitButton.disabled = false;
}
