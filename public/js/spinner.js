export const hideSpinner = () => {
  const el = document.querySelector('.spinner__container');
  if (el) el.parentElement.removeChild(el);
};

export const renderSpinner = (text) => {
  const markup = `
    <div class="spinner__container">
        <div class="spinner"></div>
        <div class="spinner__text">${text}</div>
    </div>
    `;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  //window.setTimeout(hideSpinner, 4000);
};
