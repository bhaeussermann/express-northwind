import { timeout, parseResponseAsJson } from './common.js';

'use strict';

var employees;
var filteredEmployees;

document.addEventListener('DOMContentLoaded', async function() {
  const controller = new AbortController();
  try {
    filteredEmployees = employees = 
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

  refreshEmployees();
});

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', function() {
  const searchTerms =  searchInput.value.toLowerCase().trim().split(' ');

  if (!searchTerms.length) {
    filteredEmployees = employees;
  }
  else {
    const isMatch = function(employee) {
      for (const termIndex in searchTerms) {
        const term = searchTerms[termIndex];
        if ((employee.firstName.toLowerCase().indexOf(term) === -1) && (employee.lastName.toLowerCase().indexOf(term) === -1) && (employee.title.toLowerCase().indexOf(term) === -1))
          return false;
      }
      return true;
    };

    filteredEmployees = employees.filter(isMatch);
  }

  refreshEmployees();
});


function refreshEmployees() {
  const employeesTable = document.getElementById('employees-table-body');

  if (filteredEmployees.length) {
    while (employeesTable.lastChild)
      employeesTable.removeChild(employeesTable.lastChild);

    filteredEmployees.forEach(e => {
      const listItem = document.createElement('tr');
      listItem.appendChild(createTableDataElement(e.lastName));
      listItem.appendChild(createTableDataElement(e.firstName));
      listItem.appendChild(createTableDataElement(e.title));
      employeesTable.appendChild(listItem);
    });

    document.getElementById('employees-container').style = 'display: block';
    document.getElementById('no-results').style = 'display: none';
  }
  else {
    document.getElementById('employees-container').style = 'display: none';
    document.getElementById('no-results').style = 'display: block';
  }
}

function createTableDataElement(text) {
  const element = document.createElement('td');
  element.appendChild(document.createTextNode(text));
  return element;
};
