import { timeout, parseResponseAsJson } from './common.js';

'use strict';

document.addEventListener('DOMContentLoaded', async function() {
  const controller = new AbortController();
  try {
    const employees = 
      await timeout(
        parseResponseAsJson(
          fetch('api/northwind/employees', { signal: controller.signal })
        ), 5000);
    
    const employeesList = document.getElementById('employees');
    employees.forEach(e => {
      const listItem = document.createElement('li');
      listItem.appendChild(document.createTextNode(`${e.firstName} ${e.lastName}`));
      employeesList.appendChild(listItem);
    });
  }
  catch (error) {
    controller.abort();
    const errorElement = document.getElementById('error');
    errorElement.textContent = 'Error loading employees: ' + error.message
    errorElement.style = 'display: block';
    throw error;
  }
});
