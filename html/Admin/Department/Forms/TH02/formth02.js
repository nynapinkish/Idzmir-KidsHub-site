document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("formth02");

  // Disable all form inputs
  const allInputs = form.querySelectorAll('input, select, textarea, button[type="submit"]');
  allInputs.forEach(function(input) {
    input.disabled = true;
    input.style.cursor = 'not-allowed';
    input.style.opacity = '0.6';
  });

  // Disable custom selects
  const customSelects = document.querySelectorAll('.custom-select .selected');
  customSelects.forEach(function(select) {
    select.style.pointerEvents = 'none';
    select.style.opacity = '0.6';
    select.style.cursor = 'not-allowed';
  });

  // Disable gender options
  const genderOptions = document.querySelectorAll('.ca01-gender-option');
  genderOptions.forEach(function(option) {
    option.style.pointerEvents = 'none';
    option.style.opacity = '0.6';
    option.style.cursor = 'not-allowed';
  });

  // Disable consent label
  const consentLabel = document.querySelector('.consent-label');
  if (consentLabel) {
    consentLabel.style.pointerEvents = 'none';
    consentLabel.style.opacity = '0.6';
    consentLabel.style.cursor = 'not-allowed';
  }
});