var taskInput = document.getElementById("new-task"); // new-task
var addButton = document.getElementsByTagName("button")[0];//first button
var incompleteTasksHolder = document.getElementById("incomplete-tasks"); //incomplete-tasks
var completedTasksHolder = document.getElementById("completed-tasks"); //completed-tasks

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firestore } from "firebase/firestore";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDoCcDbXMxxNh2F9pxErtp771d5FvCMRlg",
  authDomain: "to-do-list-9619b.firebaseapp.com",
  projectId: "to-do-list-9619b",
  storageBucket: "to-do-list-9619b.appspot.com",
  messagingSenderId: "906292736014",
  appId: "1:906292736014:web:89dda87c92905fdd720c5f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get a reference to the Firestore database
const db = firestore(app);



//New Task List item

var createNewTaskElement = function(taskString) {
	// create List Item
  var listItem = document.createElement("li");
  // input checkbox
  var checkBox = document.createElement("input");
  // label
  var label = document.createElement("label");
  // input (text)
  var editInput = document.createElement("input");
  // button.edit
  var editButton = document.createElement("button");
  // button.delete
  var deleteButton = document.createElement("button");
  
  //Each element needs modified 
  
  checkBox.type = "checkBox";
  editInput.type = "text";
  
  editButton.innerText = "Edit";
  editButton.className = "edit";
  deleteButton.innerText = "Delete";
  deleteButton.className = "delete";
  
  label.innerText = taskString;
  
  // Each element needs appending
  listItem.appendChild(checkBox);
  listItem.appendChild(label);
  listItem.appendChild(editInput);
  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);

	return listItem;
}


//Add a new task
var addTask = function() {
  console.log("Add Task...");
  //Create a new list item with the text from the #new-task:
  var listItem = createNewTaskElement(taskInput.value);
  //Append listItem to incompleteTaskHolder
  incompleteTasksHolder.appendChild(listItem);
  // Save the new task to Firestore
  db.collection("tasks").add({
    text: taskInput.value,
    completed: false
  })
  .then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
    // Set a data attribute on the list item with the Firestore document ID
    listItem.setAttribute("data-task-id", docRef.id);
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
  });
  bindTaskEvents(listItem, taskCompleted);
  taskInput.value = "";

  // Add an event listener to the list item's edit button
  var editButton = listItem.querySelector(".edit");
  editButton.addEventListener("click", editTask);

  // Add an event listener to the list item's delete button
  var deleteButton = listItem.querySelector(".delete");
  deleteButton.addEventListener("click", deleteTask);

  // Add an event listener to the list item's checkbox
  var checkBox = listItem.querySelector("input[type=checkbox]");
  checkBox.addEventListener("change", taskCompleted);
};

const tasksRef = firebase.database().ref('tasks');

// Find task by ID
function findTaskById(taskList, taskId) {
  return taskList.find(task => task.id === taskId);
}

// Edit task
function editTask(taskId) {
  const taskList = getTaskList();
  const task = findTaskById(taskList, taskId);

  if (!task) {
    console.log('Task not found');
    return;
  }

  console.log('Current task:', task);
  
  const newTitle = prompt('Enter new title (or leave blank to keep current title):', task.title) || task.title;
  const newDescription = prompt('Enter new description (or leave blank to keep current description):', task.description) || task.description;
  const newDueDate = prompt('Enter new due date (or leave blank to keep current due date):', task.dueDate) || task.dueDate;
  
  const updatedTask = {
    ...task,
    title: newTitle,
    description: newDescription,
    dueDate: newDueDate,
  };
  
  tasksRef.child(taskId).set(updatedTask)
    .then(() => {
      console.log('Task updated successfully');
    })
    .catch(error => {
      console.error('Error updating task:', error);
    });
}

// Delete task
function deleteTask(taskId) {
  const taskList = getTaskList();
  const task = findTaskById(taskList, taskId);

  if (!task) {
    console.log('Task not found');
    return;
  }
  
  tasksRef.child(taskId).remove()
    .then(() => {
      console.log('Task deleted successfully');
    })
    .catch(error => {
      console.error('Error deleting task:', error);
    });
}

//Mark a task as complete
var taskCompleted = function() {
  console.log("Task Complete...");
  //When the Checkbox is checked 
  //Append the task list item to the #completed-tasks ul
  var listItem = this.parentNode;
  completedTasksHolder.appendChild(listItem);
  // Get the Firestore document ID from the data attribute
  var taskId = listItem.getAttribute("data-task-id");
  // Update the completed field in the Firestore document
  db.collection("tasks").doc(taskId).update({
    completed: true
  })
  .then(function() {
    console.log("Document successfully updated");
  })
  .catch(function(error) {
    console.error("Error updating document: ", error);
  });
  bindTaskEvents(listItem, taskIncomplete);
}

//Mark a task as incomplete
var taskIncomplete = function() {
  console.log("Task Incomplete...");
  //When the checkbox is unchecked appendTo #incomplete-tasks
  var listItem = this.parentNode;
  incompleteTasksHolder.appendChild(listItem);
  // Get the Firestore document ID from the data attribute
  var taskId = listItem.getAttribute("data-task-id");
  // Update the completed field in the Firestore document
  db.collection("tasks").doc(taskId).update({
    completed: false
  })
  .then(function() {
    console.log("Document successfully updated");
  })
  .catch(function(error) {
    console.error("Error updating document: ", error);
  });
}

//Set the click handler to the addTask function
addButton.addEventListener("click", addTask);



var bindTaskEvents = function(taskListItem, checkBoxEventHandler) {
  	console.log("Bind List item events");
  	// select listitems chidlren
  	var checkBox = taskListItem.querySelector('input[type="checkbox"]');
    var editButton = taskListItem.querySelector("button.edit");
    var deleteButton = taskListItem.querySelector("button.delete");
		//bind editTask to edit button
  	editButton.onclick = editTask;
		//bind deleteTask to delete button
 		deleteButton.onclick = deleteTask;
		//bind checkBoxEventHandler to checkbox
  	checkBox.onchange = checkBoxEventHandler;
  
}

//cycle over incompleteTaskHolder ul list items
for (var i = 0; i < incompleteTasksHolder.children.length; i ++) {
  //bind events to list item's children (taskCompleted)	
  bindTaskEvents(incompleteTasksHolder.children[i], taskCompleted);
}

//cycle over completedTaskHolder ul list items
for (var i = 0; i < completedTasksHolder.children.length; i ++) {
  //bind events to list item's children (taskCompleted)	
  bindTaskEvents(completedTasksHolder.children[i], taskIncomplete);
}


  
  
  
  
  
  
  
  