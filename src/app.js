import { transitApi, mapApi, bBox } from "./modules/api.js";
import { createPlaceObj, createSegmentObj, createErrorDiv, recommendTripUL, alternativeTripUL } from "./modules/create.js";
import { removeClassFromDest, removeClassFromOrig, originUL, destinationUL, removeErrorDiv } from "./modules/remove.js";

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const planTripButton = document.querySelector('.plan-trip');

function handleOriginSubmit(e) {
  e.preventDefault()
  const input = e.target[0].value
  if (input !== '') {
    getOriginPlaces(input);
    originUL.innerHTML = '';
  } else {
    originUL.innerHTML = '';
    return;
  }
}

function handleDestinationSubmit(e) {
  e.preventDefault()
  const input = e.target[0].value
  if (input !== '') {
    getDestinationPlaces(input);
    destinationUL.innerHTML = '';
  } else {
    destinationUL.innerHTML = '';
    return;
  }
}

function handleClickOnOriginUL(e) {
  if (e.target.nodeName === 'LI') {
    removeClassFromOrig();
    e.target.classList.add('selected')
  }
  if (e.target.parentElement.nodeName === 'LI') {
    removeClassFromOrig();
    e.target.parentElement.classList.add('selected')
  }
}

function handleClickOnDestinationUL(e) {
  if (e.target.nodeName === 'LI') {
    removeClassFromDest();
    e.target.classList.add('selected')
  }
  if (e.target.parentElement.nodeName === 'LI') {
    removeClassFromDest();
    e.target.parentElement.classList.add('selected')
  }
}

function handleClickOnTripButton(e) {
  const originEL = originUL.querySelector('.selected');
  const destinationEL = destinationUL.querySelector('.selected');
  if (originEL === null || destinationEL === null) {
    createErrorDiv('please finish your trips specification')
    return;
  }
  if (originEL.dataset.long === destinationEL.dataset.long) {
    createErrorDiv('you choose the same location');
    return;
  }
  removeErrorDiv()
  recommendTripUL.innerHTML = '';
  alternativeTripUL.innerHTML = '';
  const origin = {
    lat: originEL.dataset.lat,
    long: originEL.dataset.long
  }
  const destination = {
    lat: destinationEL.dataset.lat,
    long: destinationEL.dataset.long
  }
  getTripData(origin.lat, origin.long, destination.lat, destination.long);
}

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
  }).catch(error => {
    const notFound403 = document.createElement('DIV');
    notFound403.innerHTML = 'Sorry this place does not exist'
    originUL.appendChild(notFound403)
  })
}

function getDestinationPlaces(name) {
  fetch(`${mapApi.url}/${name}.json?bbox=${bBox.minLon},${bBox.minLat},${bBox.maxLong},${bBox.maxLat}&limit=10&access_token=${mapApi.key}`)
  .then(response => response.json())
  .then(data => {
    if (data.features.length === 0) {
      const error = document.createElement('DIV');
      error.innerHTML = 'Sorry this place does not exist';
      destinationUL.appendChild(error);
      return;
    }
    data.features.forEach(place => {
      renderDestinationList(createPlaceObj(place));
    });
  }).catch(error => {
    const notFound403 = document.createElement('DIV');
    notFound403.innerHTML = 'Sorry this place does not exist'
    destinationUL.appendChild(notFound403)
  })
}

function renderOriginList(placeObj) {
  const {name, address, longitude, latitude} = placeObj;
  originUL.insertAdjacentHTML('beforeend', 
  `<li data-long=${longitude} data-lat=${latitude} class=>
    <div class="name">${name}</div>
    <div>${address}</div>
  </li>`
  )
}

function renderDestinationList(placeObj) {
  const {name, address, longitude, latitude} = placeObj;
  destinationUL.insertAdjacentHTML('beforeend', 
  `<li data-long=${longitude} data-lat=${latitude} class=>
    <div class="name">${name}</div>
    <div>${address}</div>
  </li>`
  )
}

function getTripData(orgLat, orgLon, destLat, destLon) {
  fetch(`${transitApi.url}?api-key=${transitApi.key}&origin=geo/${orgLat},${orgLon}&destination=geo/${destLat},${destLon}`)
  .then(response => response.json())
  .then(data => {
    if (data.plans.length === 0) {
      createErrorDiv('Sorry no trips found at this time');
      return;
    }
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
    createRecommendArrObj(fastestPlan);
    createAlternativeArrObj(alternativePlans);
  })
}

function createRecommendArrObj(fastestPlan) {
  const newObjArr = [];
  fastestPlan.segments.forEach(seg => {
    newObjArr.push(createSegmentObj(seg))
  });
  renderRecommendTrip(newObjArr)
}

function createAlternativeArrObj(objArray) {
  objArray.forEach(planObj => {
    const newObjArr = [];
    planObj.segments.forEach(seg => {
      newObjArr.push(createSegmentObj(seg))
    });
    renderAlternativeTrips(newObjArr); 
  });
}

function renderRecommendTrip(objArray) {
  recommendTripUL.insertAdjacentHTML('beforeend', 
  `<h2>Recommended</h2>`
  )
  objArray.forEach(section => {
    if (section.type === 'walk') {
      recommendTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${section.time} ${section.time === 1 ? 'minute' : 'minutes'}
        to ${section.stopName === 'destination' ? `your ${section.stopName}` : `stop #${section.stopNum}-${section.stopName}`}
      </li>`
      )
    }
    if (section.type === 'ride') {
      recommendTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-bus" aria-hidden="true"></i>Ride the ${section.route} for
        ${section.time} ${section.time === 1 ? 'minute' : 'minutes'}.
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

function renderAlternativeTrips(objArray) {
  alternativeTripUL.insertAdjacentHTML('beforeend', 
  `<h2>Alternative</h2>`
  )
  objArray.forEach(section => {
    if (section.type === 'walk') {
      alternativeTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${section.time} ${section.time === 1 ? 'minute' : 'minutes'}
        to ${section.stopName === 'destination' ? `your ${section.stopName}` : `stop #${section.stopNum}-${section.stopName}`}
      </li>`
      )
    }
    if (section.type === 'ride') {
      alternativeTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-bus" aria-hidden="true"></i>Ride the ${section.route} for
        ${section.time} ${section.time === 1 ? 'minute' : 'minutes'}.
      </li>`
      )
    }
    if (section.type === 'transfer') {
      alternativeTripUL.insertAdjacentHTML('beforeend', 
      `<li>
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop #${section.stop1Num} - ${section.stop1Name} to 
        stop #${section.stop2Num} - ${section.stop2Name}.
      </li>`
      )
    }
  });
}

originForm.addEventListener('submit', handleOriginSubmit);
destinationForm.addEventListener('submit', handleDestinationSubmit);
originUL.addEventListener('click', handleClickOnOriginUL);
destinationUL.addEventListener('click', handleClickOnDestinationUL);
planTripButton.addEventListener('click', handleClickOnTripButton);