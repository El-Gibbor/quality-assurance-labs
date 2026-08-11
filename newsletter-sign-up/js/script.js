const card = document.querySelector(".card");
const signupView = document.getElementById("signup-view");
const signupForm = document.querySelector(".signup-form");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const cardArt = document.querySelector(".card__art");
const successView = document.getElementById("success-view");
const successEmail = document.getElementById("success-view__email");
const dismissButton = document.getElementById("dismiss-success");

const EMPTY_FIELD_MESSAGE = "Email address is required";
const INVALID_FORMAT_MESSAGE = "Valid email required";

// Empty and malformed values get distinct messages.
function getValidationMessage(value) {
  if (value.trim() === "") {
    return EMPTY_FIELD_MESSAGE;
  }
  if (!emailInput.validity.valid) {
    return INVALID_FORMAT_MESSAGE;
  }
  return "";
}

function showValidationState(message) {
  emailError.textContent = message;
  emailInput.classList.toggle("signup-form__input--invalid", message !== "");
  emailInput.setAttribute("aria-invalid", message !== "");
}

function validateEmail() {
  const message = getValidationMessage(emailInput.value);
  showValidationState(message);
  return message === "";
}

function showSuccess(email) {
  successEmail.textContent = email;
  signupView.hidden = true;
  cardArt.hidden = true;
  successView.hidden = false;
  card.classList.add("card--success");
  // Moves the screen reader's focus onto the new view so its heading gets
  // announced, since the swap happens without a page navigation.
  successView.focus();
}

function showSignupForm() {
  successView.hidden = true;
  signupView.hidden = false;
  cardArt.hidden = false;
  card.classList.remove("card--success");
  signupForm.reset();
  showValidationState("");
  emailInput.focus();
}

// Errors start showing only after a blur or submit, then stay live on
// every keystroke after that.
let hasAttemptedSubmission = false;

emailInput.addEventListener("blur", () => {
  hasAttemptedSubmission = true;
  validateEmail();
});

emailInput.addEventListener("input", () => {
  if (hasAttemptedSubmission) {
    validateEmail();
  }
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hasAttemptedSubmission = true;

  const isValid = validateEmail();
  if (isValid) {
    showSuccess(emailInput.value);
  }
});

dismissButton.addEventListener("click", showSignupForm);
