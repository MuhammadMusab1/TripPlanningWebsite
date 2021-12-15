import { transitApi, mapApi, bBox } from "./modules/api.js";
import { createPlaceObj } from "./modules/makeObj.js";
import { removeClassFromDest, removeClassFromOrig, originUL, destinationUL } from "./modules/remove-class.js"

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');

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

destinationForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = e.target[0].value
  if (input !== '') {
    getDestinationPlaces(input)
    destinationUL.innerHTML = ''
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
      renderOriginList(createPlaceObj(place))
    })
  })
}

function getDestinationPlaces(name) {
  fetch(`${mapApi.url}/${name}.json?bbox=${bBox.minLon},${bBox.minLat},${bBox.maxLong},${bBox.maxLat}&limit=10&access_token=${mapApi.key}`)
  .then(response => response.json())
  .then(data => {
    if (data.features.length === 0) {
      const error = document.createElement('DIV');
      error.innerHTML = 'Sorry this place does not exist'
      destinationUL.appendChild(error)
      return;
    }
    data.features.forEach(place => {
      renderDestinationList(createPlaceObj(place))
    })
  })
}

function renderOriginList(placeObj) {
  const {name, address, longitude, latitude} = placeObj
  originUL.insertAdjacentHTML('beforeend', 
  `<li data-long=${longitude} data-lat=${latitude} class=>
    <div class="name">${name}</div>
    <div>${address}</div>
  </li>`
  )
}

function renderDestinationList(placeObj) {
  const {name, address, longitude, latitude} = placeObj
  destinationUL.insertAdjacentHTML('beforeend', 
  `<li data-long=${longitude} data-lat=${latitude} class=>
    <div class="name">${name}</div>
    <div>${address}</div>
  </li>`
  )
}