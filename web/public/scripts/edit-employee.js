'use strict';

import { timeout, parseResponseAsJson } from './common.js';

document.addEventListener('DOMContentLoaded', function() {
  registerEventListeners();
});

function registerEventListeners() {
  document.getElementById('form').addEventListener('submit', save);
  document.getElementById('cancel-button').addEventListener('click', navigateUp);
}

async function save() {
  document.getElementById('save-indicator').style = 'display: inline-block';
  const body = {
    firstName: document.getElementById('first-name').value,
    lastName: document.getElementById('last-name').value,
    title: document.getElementById('title').value,
    birthDate: document.getElementById('birth-date').value
  };
  const controller = new AbortController();
  try {
    await timeout(
      parseResponseAsJson(
        fetch('/api/northwind/employees', 
        { 
          method: 'post', 
          body: JSON.stringify(body),
          headers: {
              'Content-Type': 'application/json',
          },
          signal: controller.signal
        })
      ), 5000);
  }
  catch (error) {
    controller.abort();
    const errorElement = document.getElementById('error');
    errorElement.textContent = 'Error saving employee: ' + error.message
    errorElement.style = 'display: block';
    throw error;
  }
  finally {
    document.getElementById('save-indicator').style = 'display: none';
  }
  
  navigateUp();
}

function navigateUp() {
  const location = window.location.toString();
  if (location[location.length - 1] === '/')
    location = location.substr(0, location.length - 1);
  window.location = location.substr(0, location.lastIndexOf('/'));
}
