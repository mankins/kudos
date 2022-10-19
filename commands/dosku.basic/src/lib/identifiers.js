import chalk from "chalk";

const normalizeIdentifier = (rawIdentifier = '', { DEFAULT_SCOPE = 'twitter' }) => {

  // simple version for now, could get more complicated
  // we want another layer to parse and remove @ 
  // we should return a prefixed (scoped) identifier in lowercase, delim with a :

  if (rawIdentifier.indexOf('@') !== -1) {
    throw new Error('identifier should not contain @');
  }
  if (rawIdentifier.match(/\s/)) {
    throw new Error('identifier should not contain whitespace');
  }

  let identifier = rawIdentifier.toLowerCase();

  // scope should not contain a :, but value could?

  // expect: [SCOPE:]VALUE 
  if (identifier.indexOf(':') === -1) {
    // received: creatorid or @creatorid
    // normalized: DEFAULT_SCOPE:creatorid
    return `${DEFAULT_SCOPE}:${identifier}`;    
  } else {
    return identifier;
  }
};

export { normalizeIdentifier };
