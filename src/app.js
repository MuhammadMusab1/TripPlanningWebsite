import { transitApi, mapApi, bBox } from "./modules/api.js";
import { createPlaceObj } from "./modules/makeObj.js";
import { removeClassFromDest, removeClassFromOrig, originUL, destinationUL } from "./modules/remove-class.js"

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const planTripButton = document.querySelector('.plan-trip');
const busContainer = document.querySelector('.bus-container')

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
    });
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
    });
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

originUL.addEventListener('click', (e) => {
  if (e.target.nodeName === 'LI') {
    removeClassFromOrig()
    e.target.classList.add('selected')
  }
  if (e.target.parentElement.nodeName === 'LI') {
    removeClassFromOrig()
    e.target.parentElement.classList.add('selected')
  }
});

destinationUL.addEventListener('click', (e) => {
  if (e.target.nodeName === 'LI') {
    removeClassFromDest()
    e.target.classList.add('selected')
  }
  if (e.target.parentElement.nodeName === 'LI') {
    removeClassFromDest()
    e.target.parentElement.classList.add('selected')
  }
});

planTripButton.addEventListener('click', handleClick)

function handleClick(e) {
  const originEL = originUL.querySelector('.selected')
  const destinationEL = destinationUL.querySelector('.selected')
  if (originEL === null || destinationEL === null) {
    const error = document.createElement('DIV')
    error.innerHTML = 'please finish the specification of your trip'
    busContainer.innerHTML = ''
    busContainer.appendChild(error)
    return;
  }
  if (originEL.dataset.long === destinationEL.dataset.long) {
    const error = document.createElement('DIV')
    error.innerHTML = 'you picked the same location. choose another one.'
    busContainer.innerHTML = ''
    busContainer.appendChild(error)
    return;
  }
  const origin = {
    lat: originEL.dataset.lat,
    long: originEL.dataset.long
  }
  const destination = {
    lat: destinationEL.dataset.lat,
    long: destinationEL.dataset.long
  }
  console.log(origin.lat, origin.long, destination.lat, destination.long)
}