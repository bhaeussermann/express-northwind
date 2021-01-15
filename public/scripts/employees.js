'use strict';

import { timeout, resolveResponse, parseResponseAsJson } from './common.js';

const SortDirectionEnum = Object.freeze({ ascending: 0, descending: 1 });

var employees;
var sortedField = 'lastName';
var sortDirection = SortDirectionEnum.ascending;

document.addEventListener('DOMContentLoaded', async function() {
  registerEventListeners();
  await loadEmployees();
});

function registerEventListeners() {
  document.getElementById('add-button').addEventListener('click', addEmployee);

  document.getElementById('search-input').addEventListener('input', refreshEmployees);
  
  const sortableColumns = document.getElementsByClassName('sortable');
  for (var columnIndex = 0; columnIndex < sortableColumns.length; columnIndex++) {
    const sortableColumn = sortableColumns[columnIndex];
    sortableColumn.addEventListener('click', function() {
      const previousSortedColumn = document.getElementById(sortedField + '-column')
      previousSortedColumn.classList.remove('sort-arrow');
      previousSortedColumn.classList.remove('up');
      previousSortedColumn.classList.remove('down');

      const newSortedField = this.id.replace('-column', '');
      if (sortedField === newSortedField)
        sortDirection = sortDirection === SortDirectionEnum.ascending ? SortDirectionEnum.descending : SortDirectionEnum.ascending;
      else
        sortDirection = SortDirectionEnum.ascending;

      sortedField = newSortedField;
      const sortedColumn = document.getElementById(sortedField + '-column')
      sortedColumn.classList.add('sort-arrow');
      sortedColumn.classList.add(sortDirection === SortDirectionEnum.ascending ? 'up' : 'down');

      refreshEmployees();
    });
  }
}

async function loadEmployees() {
  document.getElementById('busy-indicator').style = 'display: block';
  const controller = new AbortController();
  try {
    employees = 
      await timeout(
        parseResponseAsJson(
          fetch('/api/northwind/employees', { signal: controller.signal })
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
    const compare = e1[sortedField].toLowerCase() < e2[sortedField].toLowerCase() ? -1 : 1;
    return sortDirection === SortDirectionEnum.ascending ? compare : -compare;
  });

  const employeesTable = document.getElementById('employees-table-body');

  if (filteredEmployees.length) {
    while (employeesTable.lastChild)
      employeesTable.removeChild(employeesTable.lastChild);
    
    const editClicked = function() {
      const employeeId = JSON.parse(this.getAttribute('data-data'));
      navigate(employeeId);
    };

    const deleteClicked = async function() {
      const employee = JSON.parse(this.getAttribute('data-data'));
      await deleteEmployee(employee);
    };
    
    filteredEmployees.forEach(e => {
      const listItem = document.createElement('tr');
      listItem.appendChild(createTableDataTextElement(e.lastName));
      listItem.appendChild(createTableDataTextElement(e.firstName));
      listItem.appendChild(createTableDataTextElement(e.title));
      listItem.appendChild(createTableDataLinkElement('Edit', e.id, editClicked));
      listItem.appendChild(createTableDataLinkElement('Delete', e, deleteClicked, 'delete'));
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

function addEmployee() {
  navigate('add');
}

async function deleteEmployee(employee) {
  if (confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) {
    const busyIndicator = document.getElementById('delete-busy-' + employee.id);
    busyIndicator.style = 'display: inline-block; margin-left: 10px;';
    const controller = new AbortController();
    try {
      await timeout(
        resolveResponse(
          fetch('/api/northwind/employees/' + employee.id, { method: 'delete', signal: controller.signal })
        ), 5000);
    }
    catch (error) {
      controller.abort();
      document.getElementById('delete-error-' + employee.id).style = 'dislay: inline-block';
      document.getElementById(`delete-error-${employee.id}-message`).innerText = error.message;
      throw error;
    }
    finally {
      busyIndicator.style = 'display: none';
    }

    await loadEmployees();
  }
}

function navigate(relativePath) {
  var currentLocation = window.location.href;
  while ((currentLocation[currentLocation.length - 1] === '#') || (currentLocation[currentLocation.length - 1] === '/'))
    currentLocation = currentLocation.substring(0, currentLocation.length - 1);
  window.location = `${currentLocation}/${relativePath}`;
}

function createTableDataTextElement(text) {
  const element = document.createElement('td');
  element.appendChild(document.createTextNode(text));
  return element;
};

function createTableDataLinkElement(text, data, clickAction, idPrefix) {
  const divElement = document.createElement('div');

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', '#');
  linkElement.setAttribute('data-data', JSON.stringify(data));
  linkElement.appendChild(document.createTextNode(text));
  linkElement.addEventListener('click', clickAction);
  divElement.appendChild(linkElement);

  if (idPrefix) {
    const spinnerElement = document.createElement('div');
    spinnerElement.style = 'display: none; margin-left: 10px;';
    spinnerElement.id = idPrefix + '-busy-' + data.id;
    spinnerElement.className = 'spinner inline-spinner';
    for (var i = 0; i < 12; i++)
      spinnerElement.appendChild(document.createElement('div'));
    divElement.appendChild(spinnerElement);

    const errorElement = document.createElement('span');
    errorElement.style = 'display: none';
    errorElement.id = idPrefix + '-error-' + data.id;
    errorElement.className = 'icon-tooltip';
    const errorIcon = document.createElement('i');
    errorIcon.setAttribute('class', 'fa fa-exclamation-circle');
    errorElement.appendChild(errorIcon);
    const errorMessageElement = document.createElement('span');
    errorMessageElement.id = errorElement.id + '-message';
    errorMessageElement.className = 'icon-tooltip-text';
    errorElement.appendChild(errorMessageElement);
    divElement.appendChild(errorElement);
  }

  const element = document.createElement('td');
  element.appendChild(divElement);
  return element;
}
