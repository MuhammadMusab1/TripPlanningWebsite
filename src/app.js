const originForm = document.querySelector('.origin-form');

originForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = e.target[0].value
  if (input !== '') {
    console.log(input)
  } else {
    return;
  }
});