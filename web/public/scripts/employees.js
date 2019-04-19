'use strict';

document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/northwind/employees')
  .then(response => response.json())
  .then(employees => {
    const employeesList = document.getElementById('employees');
    employees.forEach(e => {
      const listItem = document.createElement('li');
      listItem.appendChild(document.createTextNode(`${e.firstName} ${e.lastName}`));
      employeesList.appendChild(listItem);
    });
  })
  .catch(error => console.error(error))
});
