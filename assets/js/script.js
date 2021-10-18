let pageContentEl = document.querySelector("#page-content");

let tasksInProgressEl = document.querySelector("#tasks-in-progress");
let tasksCompletedEl = document.querySelector("#tasks-completed");

let taskIdCounter = 0;

let formEl = document.querySelector("#task-form");
let tasksToDoEl = document.querySelector("#tasks-to-do");

let tasks = [];

let taskFormHandler = function(event) {

    event.preventDefault();
    let taskNameInput = document.querySelector("input[name='task-name']").value;
    let taskTypeInput = document.querySelector("select[name='task-type']").value;

    //check if input values are empty strings (falsy)
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }

    formEl.reset();

    let isEdit = formEl.hasAttribute("data-task-id");
    
    //package up data as an object
    let taskDataObj = {
        name: taskNameInput,
        type: taskTypeInput,
        status: "to do"
    }

    //has data attritubte, so get task id and call function to complete edit process
    if (isEdit) {
        let taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    //if no data attritubte, so create object as normal and pass to createTaskEl function
    else {
        let taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        }

        createTaskEl(taskDataObj);
    } 
}

let completeEditTask = function(taskName, taskType, taskId) {
    //find the matching task list item
    let taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");


    //set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    //loop through tasks array and task object with new content
    for (var i =0; i<tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };

    //let u know
    alert("Task Updated!");

    //save
    saveTasks();

    //rest form
    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";
};

let createTaskEl = function(taskDataObj) {
    // create list item
    let listItemEl = document.createElement("li");
    listItemEl.className = "task-item";

    //add task id as a custom attribute
    listItemEl.setAttribute("data-task-id",taskIdCounter);

    //create div to hold task info and add to list item
    let taskInfoEl = document.createElement("div");

    //give it a class name
    taskInfoEl.className = "task-info";

    //add HTML content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
    listItemEl.appendChild(taskInfoEl);

    //set object to have id property equal to taskIdCounter number
    taskDataObj.id = taskIdCounter;

    //push the newly created object into the tasks array
    tasks.push(taskDataObj);

    //save tasks to localStorage
    saveTasks();

    //create buttons that correspond to the task id by storing that element in a variable
    let taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);
    
    //add entire list item to the list
    tasksToDoEl.appendChild(listItemEl);

    //increase task counter for next unique id
    taskIdCounter++;
};
//taskId parameter to pass a different id into the function each time to keep track of which elements we're creating for which task
let createTaskActions = function(taskId) {
    let actionContainerEl = document.createElement("div");
    actionContainerEl.className ="task-actions";

    //create dit button
    let editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id",taskId);

    actionContainerEl.appendChild(editButtonEl);

    //create delete button
    let deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    //dropdown (select) element
    let statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    let statusChoices = ["To Do", "In Progress", "Completed"];

    for (let i = 0; i <statusChoices.length; i++) {
        //create option element
        let statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        //append to select/dropdown
        statusSelectEl.appendChild(statusOptionEl);
    }

    actionContainerEl.appendChild(statusSelectEl);

    return actionContainerEl;
}

formEl.addEventListener("submit", taskFormHandler);

let taskButtonHandler = function(event) {

    //get target element from event
    let targetEl = event.target;

    //this uses class to determine if edit button was clicked then will run edit function
    if (targetEl.matches(".edit-btn")){
        let taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }

    //this uses class to determine if delete buton was clicked then runs delete function
    else if (event.target.matches(".delete-btn")) {
        let taskId = targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};

let editTask = function(taskId) {

    //get task list item element
    let taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get content from task name and type
    let taskName = taskSelected.querySelector("h3.task-name").textContent;
    let taskType = taskSelected.querySelector("span.task-type").textContent;

    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    //show we are editing and switch submit button to say 'save task'
    document.querySelector("#save-task").textContent = "Save Task";

    //add taskId to a data-task-id attritubte on the form so we can use it later to save correct task
    formEl.setAttribute("data-task-id", taskId);
};

let taskStatusChangeHandler = function(event) {
    //get the task item's id
    let taskId = event.target.getAttribute("data-task-id");

    //get the currently selected option's value and convert to lowercase
    let statusValue = event.target.value.toLowerCase();

    //find the parent task item element based on the id
    let taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    //update tasks in tasks array
    for (let i = 0; i<tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }
    //save
    saveTasks();
};

let deleteTask = function(taskId) {
    let taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    //create new array to hold updated list of tasks
    let updatedTaskArr = [];

    //loop through current tasks
    for (let i = 0; i <tasks.length; i++) {
        //if tasks[i].id doesn't mathc the value of taskId, let's keep that task and push it into the new array
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }

    //reassign tasks array to be the same as updatedTaskArr
    tasks = updatedTaskArr;

    //save to array
    saveTasks();
};

let saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

let loadTasks = function() {
    //get task items from localStoarge
    tasks = localStorage.getItem("tasks");
    
    //for when it's empty
    if (!tasks) {
        tasks = [];
        return false;
    }

    //convert tasks from teh string format back into an array of objects
    tasks = JSON.parse(tasks);

    //iterate through a tasks array and create task elements on the page from it
    for (let i = 0; i <tasks.length; i++) {
        tasks[i].id = taskIdCounter;
        
        //create li
        let listItemEl = document.createElement("li");
        listItemEl.className = "task-item";
        listItemEl.setAttribute("data-task-id", tasks[i].id);
        //create div
        let taskInfoEl = document.createElement("div");
        taskInfoEl.className = "task-info";
        taskInfoEl.innerHTML = "<h3 class='task-name'>" + tasks[i].name + "</h3><span class='task-type'>" + tasks[i].type + "</span>";
        //append div to li
        listItemEl.appendChild(taskInfoEl);

        //create the action for the task
        taskActionsEl = createTaskActions(tasks[i].id);

        listItemEl.appendChild(taskActionsEl);

        //check where things belong
        if (tasks[i].status === "to do") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
            tasksToDoEl.appendChild(listItemEl);
        }

        else if (tasks[i].status === "in progress") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
            tasksInProgressEl.appendChild(listItemEl);
        }

        else if (tasks[i].status === "completed") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
            tasksCompletedEl.appendChild(listItemEl);
        }

        taskIdCounter++;
    }
}

pageContentEl.addEventListener("click", taskButtonHandler);

pageContentEl.addEventListener("change", taskStatusChangeHandler);