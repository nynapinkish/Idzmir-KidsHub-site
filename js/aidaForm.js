  function toggleFormMenu() {
    const menu = document.getElementById('formMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }

  function openFormModal(formType) {
    const formContainer = document.getElementById('formContainer');
    const modal = document.getElementById('formModal');

    // Guna Google Form sama untuk semua butang
    const embedCode = `
      <iframe 
        src="https://docs.google.com/forms/d/e/1FAIpQLSfFzvXYGA_X8HtVM33sKUfrJFzrZFexcI2mGfMVu9z7vRyKlA/viewform?embedded=true" 
        width="100%" 
        height="850" 
        frameborder="0" 
        marginheight="0" 
        marginwidth="0" 
        style="border-radius: 12px;">
        Loading…
      </iframe>`;

    formContainer.innerHTML = embedCode;
    modal.style.display = 'flex';
    document.getElementById('formMenu').style.display = 'none';
  }

  function closeFormModal() {
    document.getElementById('formModal').style.display = 'none';
  }

  window.onclick = function(e) {
    const modal = document.getElementById('formModal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };