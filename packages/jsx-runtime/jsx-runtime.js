function jsx(type, props) {
  return type(props ?? {});
}

const jsxs = jsx;

function Fragment({ children }) {
  return children;
}

module.exports = {
  jsx,
  jsxs,
  Fragment,
};
