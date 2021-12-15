export function createPlaceObj(place) {
  return {
    name: place.text,
    address: place.properties.address !== undefined ? place.properties.address : 'Winnipeg',
    longitude: place.center[0],
    latitude: place.center[1]  
  }
}