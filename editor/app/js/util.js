

export function mapObject(obj, f) {
  obj = obj || {};
  return Object.keys(obj).reduce(function(acc, key) {
    acc[key] = f(obj[key], key);
    return acc;
  }, {});
}
