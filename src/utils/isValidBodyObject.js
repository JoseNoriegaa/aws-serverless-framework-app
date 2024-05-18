function isValidBodyObject(item) {
  return !item || typeof item !== 'object' || Array.isArray(item) || (Object.keys(item).length === 0) ? false : true;
}

module.exports = { isValidBodyObject };
