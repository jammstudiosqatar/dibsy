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

      fetch("https://hook.eu1.make.com/zuq5j7v25yoeqgx5snkevxyax1mp1wsa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Processing Payment");
      } else {
        console.error("Failed to send token to Make.com.");
      }
    })
    .catch((error) => console.error("Error sending token:", error));

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
