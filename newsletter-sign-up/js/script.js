const signupForm = document.querySelector(".signup-form");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");

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
    // TODO: show the success message with the submitted email.
  }
});
