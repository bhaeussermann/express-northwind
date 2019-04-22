import { timeout, parseResponseAsJson } from './common.js';

'use strict';

document.addEventListener('DOMContentLoaded', async function() {
  var employees;
  const controller = new AbortController();
  try {
    employees = 
      await timeout(
        parseResponseAsJson(
          fetch('api/northwind/employees', { signal: controller.signal })
        ), 5000);
  }
  catch (error) {
    controller.abort();
    const errorElement = document.getElementById('error');
    errorElement.textContent = 'Error loading employees: ' + error.message
    errorElement.style = 'display: block';
    throw error;
  }
  finally {
    document.getElementById('busy-indicator').style = 'display: none';
  }

  const createTableDataElement = function(text) {
    const element = document.createElement('td');
    element.appendChild(document.createTextNode(text));
    return element;
  };
  
  const employeesTable = document.getElementById('employees-table-body');
  employees.forEach(e => {
    const listItem = document.createElement('tr');
    listItem.appendChild(createTableDataElement(e.lastName));
    listItem.appendChild(createTableDataElement(e.firstName));
    listItem.appendChild(createTableDataElement(e.title));
    employeesTable.appendChild(listItem);
  });

  document.getElementById('employees-container').style = 'display: block';
});
