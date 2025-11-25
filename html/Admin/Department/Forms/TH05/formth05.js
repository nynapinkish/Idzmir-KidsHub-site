/* ============================================================
   FORM DISABLED - ALL INTERACTIONS REMOVED
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // Disable all radio buttons
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.disabled = true;
        radio.style.cursor = 'not-allowed';
    });

    // Disable all general-item containers
    const generalItems = document.querySelectorAll('.general-item');
    generalItems.forEach(item => {
        item.style.pointerEvents = 'none';
        item.style.opacity = '0.6';
        item.style.cursor = 'not-allowed';
    });

    // Disable all general2-item containers
    const general2Items = document.querySelectorAll('.general2-item');
    general2Items.forEach(item => {
        item.style.pointerEvents = 'none';
        item.style.opacity = '0.6';
        item.style.cursor = 'not-allowed';
    });

    // Disable other-input fields
    const otherInputs = document.querySelectorAll('.other-input');
    otherInputs.forEach(input => {
        input.disabled = true;
        input.style.display = 'none';
    });

    // Disable SentBy other text field
    const sentByOtherText = document.getElementById('sentByOtherText');
    if (sentByOtherText) {
        sentByOtherText.disabled = true;
        sentByOtherText.style.display = 'none';
    }

    // Disable all inputs, selects, textareas
    const allInputs = document.querySelectorAll('input, select, textarea, button[type="submit"]');
    allInputs.forEach(input => {
        input.disabled = true;
        input.style.cursor = 'not-allowed';
        input.style.opacity = '0.6';
    });
});