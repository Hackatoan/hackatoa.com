const fs = require('fs');
let file = fs.readFileSync('tests/test_app.js', 'utf8');
file = file.replace(
  'querySelector(selector) {\n       if (selector === \'.slides-track\') {\n         return {\n           style: {},\n           querySelectorAll: () => [\n             { classList: { add: () => {} } },\n             { classList: { add: () => {} } },\n             { classList: { add: () => {} } }\n           ]\n         };\n       }',
  'querySelector(selector) {\n       if (selector === \'.slides-track\') {\n         if (!this.elements[\'.slides-track\']) {\n           this.elements[\'.slides-track\'] = {\n             style: {},\n             querySelectorAll: () => [\n               { classList: { add: () => {} } },\n               { classList: { add: () => {} } },\n               { classList: { add: () => {} } }\n             ]\n           };\n         }\n         return this.elements[\'.slides-track\'];\n       }'
);
fs.writeFileSync('tests/test_app.js', file);
