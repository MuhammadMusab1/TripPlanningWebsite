import { transitApi, mapApi, bBox } from "./modules/api.js";
import { createPlaceObj, createSegmentObj } from "./modules/makeObj.js";
import { removeClassFromDest, removeClassFromOrig, originUL, destinationUL } from "./modules/remove-class.js"

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const planTripButton = document.querySelector('.plan-trip');
const busContainer = document.querySelector('.bus-container');
const recommendTripUL = document.querySelector('.my-trip');

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
  getTripData(origin.lat, origin.long, destination.lat, destination.long)
  //console.log(origin.lat, origin.long, destination.lat, destination.long)
}

function getTripData(orgLat, orgLon, destLat, destLon) {
  fetch(`${transitApi.url}?api-key=${transitApi.key}&origin=geo/${orgLat},${orgLon}&destination=geo/${destLat},${destLon}`)
  .then(response => response.json())
  .then(data => {
    let fastestPlan = data.plans[0];
    data.plans.forEach(plan => {
      if (fastestPlan.times.durations.total > plan.times.durations.total) {
        fastestPlan = plan
      }
    });

    const alternativePlans = data.plans.filter(plan => {
      if (plan.number !== fastestPlan.number) {
        return plan;
      }
    });
    createRecommendArrObj(fastestPlan) // alternatives array
    console.log(alternativePlans)
  })  
}

function createRecommendArrObj(fastestPlan) {
  const newObjArr = [];
  fastestPlan.segments.forEach(seg => {
    newObjArr.push(createSegmentObj(seg))
  });
  renderRecommendTrip(newObjArr)
}

function renderRecommendTrip(objArray) {
  recommendTripUL.innerHTML = ''
  recommendTripUL.insertAdjacentHTML('beforeend', 
  `<h2>Recommended</h2>`
  )
  objArray.forEach(section => {
    if (section.type === 'walk') {
      recommendTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${section.time} minutes
        to ${section.stopName === 'destination' ? `your ${section.stopName}` : `stop #${section.stopNum}-${section.stopName}`}
      </li>`
      )
    }
    if (section.type === 'ride') {
      recommendTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-bus" aria-hidden="true"></i>Ride the ${section.route} for
        ${section.time} minutes.
      </li>`
      )
    }
    if (section.type === 'transfer') {
      recommendTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop #${section.stop1Num} - ${section.stop1Name} to 
        stop #${section.stop2Num} - ${section.stop2Name}.
      </li>`
      )
    }
  });
}