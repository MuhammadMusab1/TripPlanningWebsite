export const originUL = document.querySelector('.origins');
export const destinationUL = document.querySelector('.destinations')

export function removeClassFromOrig() {
  const el = originUL.querySelector('.selected')
  if(el !== null) {
    el.classList.remove('selected');
  } else {
    return;
  }
}

export function removeClassFromDest() {
  const el = destinationUL.querySelector('.selected')
  if(el !== null) {
    el.classList.remove('selected');
  } else {
    return;
  }
}

export function removeErrorDiv() {
  const allErrors = document.querySelectorAll('.error');
  allErrors.forEach(error => {
    error.remove();
  })
}