// Main entry/init logic moved from script.js

import { initFirebase } from './firebase.js';

window.addEventListener('load', () => {
	initFirebase();
});

window.addEventListener('DOMContentLoaded', function() {
	// Auto-connect to Firebase if config fields are present
	var apiKey = document.getElementById('apiKey');
	var projectId = document.getElementById('projectId');
	var databaseUrl = document.getElementById('databaseUrl');
	if (apiKey && projectId && databaseUrl && apiKey.value && projectId.value && databaseUrl.value) {
		initFirebase(apiKey.value, projectId.value, databaseUrl.value);
	}
});
// Entry point for Mosjes Card Game
// Imports and wires up all modules

// ...to be filled in next steps...
