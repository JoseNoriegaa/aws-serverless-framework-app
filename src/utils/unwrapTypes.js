/**
 * Removes the data descriptors from a DynamoDB query result.
 * @param {Record<string, object>} item 
 * @returns {Record<string, object>}
 */
function unwrapTypes(item) {
  if (Array.isArray(item)) {
    return item.map(unwrapTypes);
  }

  for (let key in item) {
    const subKeys = Object.keys(item[key]);

    item[key] = item[key][subKeys[0]]
  }

  return item;
}

module.exports = {
  unwrapTypes,
};
