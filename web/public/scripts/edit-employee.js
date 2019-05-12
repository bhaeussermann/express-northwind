'use strict';

import { timeout, resolveResponse, parseResponseAsJson } from './common.js';

var isAdd;
var employeeId;

document.addEventListener('DOMContentLoaded', async function() {
  registerEventListeners();

  const url = window.location.href;
  const lastComponent = url.substring(url.lastIndexOf('/') + 1);
  isAdd = lastComponent === 'add';
  
  document.getElementById('page-title').textContent = isAdd ? 'Add Employee' : 'Edit Employee';

  if (!isAdd) {
    employeeId = lastComponent;
    await loadEmployee();
  }
});

function registerEventListeners() {
  document.getElementById('form').addEventListener('submit', save);
  document.getElementById('cancel-button').addEventListener('click', navigateUp);
}

async function loadEmployee() {
  document.getElementById('save-button').disabled = true;
  document.getElementById('first-name').disabled = true;
  document.getElementById('last-name').disabled = true;
  document.getElementById('title').disabled = true;
  document.getElementById('birth-date').disabled = true;
  document.getElementById('load-indicator').style = 'display: block';

  const controller = new AbortController();
  try {
    const employee = await timeout(
      parseResponseAsJson(
        fetch('/api/northwind/employees/' + employeeId, { signal: controller.signal })
      ), 5000);
    document.getElementById('first-name').value = employee.firstName;
    document.getElementById('last-name').value = employee.lastName;
    document.getElementById('title').value = employee.title;
    const birthDateAsDate = new Date(employee.birthDate);
    document.getElementById('birth-date').value = `${birthDateAsDate.getFullYear()}-${('0' + (birthDateAsDate.getMonth() + 1)).slice(-2)}-${('0' + birthDateAsDate.getDate()).slice(-2)}`;

    document.getElementById('save-button').disabled = false;
    document.getElementById('first-name').disabled = false;
    document.getElementById('last-name').disabled = false;
    document.getElementById('title').disabled = false;
    document.getElementById('birth-date').disabled = false;
  }
  catch (error) {
    controller.abort();
    showError('Error loading employee: ' + error.message);
    throw error;
  }
  finally {
    document.getElementById('load-indicator').style = 'display: none';
  }
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
  const requestPromise = isAdd
    ? fetch('/api/northwind/employees', 
      { 
        method: 'post', 
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })
    : fetch('/api/northwind/employees/' + employeeId, 
      { 
        method: 'put', 
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
  
  try {
    await timeout(resolveResponse(requestPromise), 5000);
  }
  catch (error) {
    controller.abort();
    showError('Error saving employee: ' + error.message);
    throw error;
  }
  finally {
    document.getElementById('save-indicator').style = 'display: none';
  }
  
  navigateUp();
}

function showError(errorMessage) {
  const errorElement = document.getElementById('error');
  errorElement.textContent = errorMessage;
  errorElement.style = 'display: block';
}

function navigateUp() {
  const location = window.location.toString();
  if (location[location.length - 1] === '/')
    location = location.substr(0, location.length - 1);
  window.location = location.substr(0, location.lastIndexOf('/'));
}
