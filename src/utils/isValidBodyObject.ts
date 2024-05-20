function isValidBodyObject(item: undefined | null | object) {
  return !item || typeof item !== 'object' || Array.isArray(item) || (Object.keys(item).length === 0) ? false : true;
}

export default isValidBodyObject;
