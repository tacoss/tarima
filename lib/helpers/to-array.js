module.exports = value => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? String(value).split(/\W/) : [];
};
