// Backend entry point — Azure Functions v4 loads this file via package.json "main",
// which triggers function registrations (app.timer, app.http) as side effects.
import './functions/generateMetadata.js';
import './functions/generateMetadataHttp.js';
import './functions/validateAuth.js';
