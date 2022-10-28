// local actions

import * as config from "./config.js";
import * as install from "./install.js";
import proxy from "./proxy.js";
import * as run from "./run.js";

const identify = proxy('identify');
const ink = proxy('ink');
const list = proxy('list');

export { config, identify, ink, install, list, run };
