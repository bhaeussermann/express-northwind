import { timeout, parseResponseAsJson } from './common.js';

'use strict';

const SortDirectionEnum = Object.freeze({ ascending: 0, descending: 1 });

var employees;
var sortedField = 'lastName';
var sortDirection = SortDirectionEnum.ascending;

document.addEventListener('DOMContentLoaded', async function() {
  registerEventListeners();
  await loadEmployees();
});

function registerEventListeners() {
  document.getElementById('search-input').addEventListener('input', refreshEmployees);
  
  const sortableColumns = document.getElementsByClassName('sortable');
  for (var columnIndex = 0; columnIndex < sortableColumns.length; columnIndex++) {
    const sortableColumn = sortableColumns[columnIndex];
    sortableColumn.addEventListener('click', function() {
      const previousSortedColumn = document.getElementById(sortedField + 'Column')
      previousSortedColumn.classList.remove('sort-arrow');
      previousSortedColumn.classList.remove('up');
      previousSortedColumn.classList.remove('down');

      const newSortedField = this.id.replace('Column', '');
      if (sortedField === newSortedField)
        sortDirection = sortDirection === SortDirectionEnum.ascending ? SortDirectionEnum.descending : SortDirectionEnum.ascending;
      else
        sortDirection = SortDirectionEnum.ascending;

      sortedField = newSortedField;
      const sortedColumn = document.getElementById(sortedField + 'Column')
      sortedColumn.classList.add('sort-arrow');
      sortedColumn.classList.add(sortDirection === SortDirectionEnum.ascending ? 'up' : 'down');

      refreshEmployees();
    });
  }
}

async function loadEmployees() {
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

  refreshEmployees();
}

function refreshEmployees() {
  const searchInput = document.getElementById('search-input')
  const searchTerms =  searchInput.value.toLowerCase().trim().split(' ');
  var filteredEmployees;
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

  filteredEmployees.sort((e1, e2) => {
    const compare = e1[sortedField] < e2[sortedField] ? -1 : 1;
    return sortDirection === SortDirectionEnum.ascending ? compare : -compare;
  });

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
