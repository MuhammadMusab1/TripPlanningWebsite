export const busContainer = document.querySelector('.bus-container');
export const recommendTripUL = document.querySelector('.my-trip');
export const alternativeTripUL = document.querySelector('.alt-trip');

export function createPlaceObj(place) {
  return {
    name: place.text,
    address: place.properties.address !== undefined ? place.properties.address : 'Winnipeg',
    longitude: place.center[0],
    latitude: place.center[1]  
  }
}

export function createSegmentObj(seg) {
  if (seg.type === 'walk') {
    return {
      type: seg.type,
      time : seg.times.durations.total,
      stopNum: seg.to === undefined  || seg.to.stop === undefined? 'none' : seg.to.stop.key ,
      stopName: seg.to === undefined || seg.to.stop === undefined? 'destination' : seg.to.stop.name
    }
  }
  if (seg.type === 'ride') {
    return {
      type: seg.type,
      time: seg.times.durations.total,
      route: seg.route.name === undefined ? seg.route.key : seg.route.name,
    }
  }
  if (seg.type === 'transfer') {
    return {
      type: seg.type,
      time: seg.times.durations.total,
      stop1Num: seg.from.stop.key,
      stop1Name: seg.from.stop.name,
      stop2Num: seg.to.stop.key,
      stop2Name: seg.to.stop.name,
    }
  }
}

export function createErrorDiv(description) {
  const errorDiv = document.createElement('DIV')
    errorDiv.classList.add('error')
    errorDiv.innerHTML = description
    recommendTripUL.innerHTML = '';
    alternativeTripUL.innerHTML = '';
    busContainer.appendChild(errorDiv);
}