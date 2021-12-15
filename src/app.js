import { transitApi, mapApi, bBox } from "./modules/api.js";

const originForm = document.querySelector('.origin-form');
const originUL = document.querySelector('.origins');

originForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = e.target[0].value
  if (input !== '') {
    getOriginPlaces(input)
    originUL.innerHTML = ''
  } else {
    return;
  }
});

function getOriginPlaces(name) {
  fetch(`${mapApi.url}/${name}.json?bbox=${bBox.minLon},${bBox.minLat},${bBox.maxLong},${bBox.maxLat}&limit=10&access_token=${mapApi.key}`)
  .then(response => response.json())
  .then(data => {
    if (data.features.length === 0) {
      const error = document.createElement('DIV');
      error.innerHTML = 'Sorry this place does not exist'
      originUL.appendChild(error)
      return;
    }
    data.features.forEach(place => {
      console.log(place)
    })
  })
}