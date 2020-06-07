'use strict';

const buildVars = require('./build-vars');

const RE_MACROS = /(?:#|<!--|\/[/*])\s*(IF(?:_?NOT)?)\s+([\s\S]*?)(?:#|<!--|\/[/*])\s*ENDIF/;

function replaceMacro(text, flags) {
  const ifRegex = /^\s*(?:#|<!--|\/[/*])\s*IF/;
  const endRegex = /^\s*(?:#|<!--|\/[/*])\s*ENDIF/;
  const getValuesRegex = /\s*(?:#|<!--|\/[/*])\s*IF(_?NOT)?\s+([a-zA-Z_]+)/;

  const lines = text.split('\n');

  let startFound = 0;
  let endFound = 0;

  for (let i = 0; i <= lines.length; i += 1) {
    if (ifRegex.test(lines[i])) startFound = i;
    if (endRegex.test(lines[i])) {
      endFound = i;
      break;
    }
  }

  const startMatch = getValuesRegex.exec(lines[startFound]);
  const flag = flags[startMatch[2]] === 'true';
  const keepBlock = startMatch[1] ? !flag : flag;

  if (keepBlock) {
    lines.splice(startFound, 1);
    lines.splice(endFound - 1, 1);
  } else {
    lines.splice(startFound, endFound - startFound + 1);
  }

  return lines.join('\n');
}

function replaceMacros(text, flags) {
  while (RE_MACROS.test(text)) text = replaceMacro(text, flags);
  return text;
}

module.exports = (text, vars) => {
  if (vars) {
    text = replaceMacros(text, vars);
    text = buildVars(text, vars);
  }

  return text;
};
