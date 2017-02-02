testData = {
  "projects": [
    {
      "_id": "5892bdffb228b27570d7c3be",
      "__v": 0,
      "projectName": "quidem",
      "tasks": [
        {
          "taskName": "qui",
          "total": 16,
          "_id": "5892bdffb228b27570d7c3c3",
          "log": [
            {
              "startTime": "20:51",
              "endTime": "17:03",
              "_id": "5892bdffb228b27570d7c3c4"
            }
          ]
        },
        {
          "taskName": "voluptatem",
          "total": 9,
          "_id": "5892bdffb228b27570d7c3c1",
          "log": [
            {
              "startTime": "6:20",
              "endTime": "13:54",
              "_id": "5892bdffb228b27570d7c3c2"
            }
          ]
        },
        {
          "taskName": "minus",
          "total": 12,
          "_id": "5892bdffb228b27570d7c3bf",
          "log": [
            {
              "startTime": "18:46",
              "endTime": "7:27",
              "_id": "5892bdffb228b27570d7c3c0"
            }
          ]
        }
      ]
    },
    {
      "_id": "5892bdffb228b27570d7c3c5",
      "__v": 0,
      "projectName": "est",
      "tasks": [
        {
          "taskName": "consequatur",
          "total": 5,
          "_id": "5892bdffb228b27570d7c3c8",
          "log": [
            {
              "startTime": "18:27",
              "endTime": "6:11",
              "_id": "5892bdffb228b27570d7c3c9"
            }
          ]
        },
        {
          "taskName": "iure",
          "total": 16,
          "_id": "5892bdffb228b27570d7c3c6",
          "log": [
            {
              "startTime": "3:05",
              "endTime": "9:24",
              "_id": "5892bdffb228b27570d7c3c7"
            }
          ]
        }
      ]
    }
  ]
}


const state = {
	projects: ["none", "Sample Project"],
	tasks: [],
	errorMessage: {
		duplicateProject: 'That project already exists. Please use a different project name',
		duplicateTask: 'That task already exists. Please use a different project name',
		invalidTime: 'Please enter a time that is greater than 0'
	}
}

const displayErrror = (element, error) => {
	element.text('error');
}

const minutesToHours = (min) => {
	return Number((Number(min)/60).toFixed(2));
}

function Task(name, totalTime, project) {
	this.name = name;
	this.project = project;
	this.totalTime = Number(totalTime);
	this.histCount = 0;
	this.hist = [totalTime];
}

Task.prototype.addTime = function(t) {
	this.totalTime += minutesToHours(t);

	if (this.hist) {
		 this.hist.push(this.totalTime);
		 this.histCount = 0;
	}

	if(this.projectAddTime) {
		this.projectAddTime(t);
	}

	renderProjectList(state, elems);
}

Task.prototype.reset = function() {
	this.totalTime = 0;

	if(this.hist) {
		this.hist.push(0);
	}
}

Task.prototype.undo = function() {
	if (this.hist && this.hist.length > 1) {
		this.hist.pop();
		this.totalTime = this.hist[this.hist.length - 1];
	}
}

function Project(name , tasks) {
  this.projectName = name;
  this.tasks = tasks;
}

Project.prototype.calculateTotalProjectTime = function () {
   return this.tasks
            	.map(task => task.totalTime)
            	.reduce((a,b) => a+b)
}

const sampleTask1 = new Task("sample task", 1 , "Sample Project");
const sampleTask2 = new Task("another sample task" , 2 , "Sample Project");

state.tasks.push(sampleTask1);
state.tasks.push(sampleTask2);


const saveTask = (task) => {
	const callback = () => console.log("Task Saved");
	const postObj = {
		"name": task.name,
		"project": task.project,
		"totalTime": task.totalTime
	}
	$.post("/tasks", postObj, callback, "json");
}

const updateAllTasks = (state) => {
	state.tasks.forEach((task) => {
		$.ajax({
			url: "/tasks",
			type: "PUT",
			data: task,
			success: (data) => {console.log("save successful")}
		});
	});
}

const getTasks = (state, elems) => {
	const callback = (data) => {
		state.tasks = data.tasks.map( task => {

			if(state.projects.indexOf(task.project) === -1) {
				state.projects.push(task.project);
			}

			return new Task(task.name, task.totalTime, task.hist, task.project)
		});

		renderTaskList(state, elems);
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
	}
	$.get("/tasks", undefined, callback);
}


const deleteTask = (state, idx, elems) => {
	/*$.ajax({
			url: "/tasks",
			type: "DELETE",
			data: state.tasks[idx]
		});*/
		bootbox.confirm(
			`Are you sure you want to delete \"${name}\"`,
			 () => {
				 state.tasks.splice(idx, 1);
				 renderTaskList(state, elems);
			 });
}

const deleteProject = (state, elems, projectName) => {
	state.tasks.forEach(task => {
		if (task.project === projectName) {
			task.project = null;
		}
	});

	state.projects = state.projects.filter(project => {
		return project !== projectName;
	});

	renderProjectList(state, elems);
	renderProjectOptions(state, elems);
	//updateAllTasks(state);
}

const getProjectValues = () => {
	const obj = {};
		state.tasks.forEach((task) => {
			obj[task.project] ? obj[task.project] += task.totalTime : obj[task.project] = task.totalTime;
		});

		return obj;
}

const renderOneProject = (state, elems, projectName, value) => {
	const resHtml = $(
		`<div>
			<div id="projectWrapper">
				<span class="project">${projectName}</span>
				<span class="projectValue">${value}</span>
				<button id="deleteProject" class="btn btn-outline-secondary">X</button>
			</div>
		</div>`
	);

	resHtml.find("#deleteProject").click(() => {
		deleteProject(state, elems, projectName);
	});
	return resHtml;
}

const renderProjectList = (state, elems) => {
	const projects = getProjectValues();
	const resHtml = Object
		.keys(projects)
		.filter(key => key !== "none" && key !== "")
		.map(key => {
		return renderOneProject(state, elems, key, projects[key]);
	});
	$("#projects").html(resHtml);
}

const renderTask = (state, elems, name, totalTime, project, idx) => {
 let task = state.tasks[idx];
 let template = $(
	`<div id="wrapper">
		<div class="timeMod well">
				<div class="topRow">
					<span class="title">${name}</span>
					<span class="acctotal">${totalTime.toFixed(2)}</span>
					<span class="project">${project}<span>
				</div>
			<div class="btn-group timeButtons">
				<button type="button" class="js-btn5 btn btn-primary">5</button>
				<button type="button" class="js-btn15 btn btn-primary">15</button>
				<button type="button" class="js-btn25 btn btn-primary" value="25">25</button>
				<input type="text" name="" id="customInput${idx}" class="customInput form-control">
				<span id="invalidTimeError"></span>

			</div>
			<div class="controlButtons">
				<button type="button" id="js-reset" class="btn btn-primary" >Reset</button>
				<button type="button" id="js-undo" class="btn btn-primary" >Undo</button>
				<button type="button" id="js-delete" class="btn btn-primary" >Delete</button>
			</div>
		</div>
	</div>`)


 	template.find(".js-btn5").click( () => {
 		task.addTime(5);
 	});

 	template.find(".js-btn15").click( () => {
		task.addTime(15);

 	});
 	template.find(".js-btn25").click( () => {
 		task.addTime(25);

 	});

 	template.find("#js-reset").click( () => {
 		task.reset();
 	});

 	template.find(`#customInput${idx}`).on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
			const input = Number($(`#customInput${idx}`).val());
 			task.addTime(input);
 			renderTaskList(state, elems);
 			//updateAllTasks(state);
 			//this.reset;
 		}
 	})

 	template.find("#js-undo").click( () => {
 		task.undo();
 		renderTaskList(state, elems);
 	})

 	template.find("#js-delete").click( () => {
		deleteTask(state, idx, elems)
		/*bootbox.confirm(
			`Are you sure you want to delete \"${name}\"`,
			 () => 'deleted' //deleteTask(state, idx)
		);*/
 	});

 	template.find(".btn").click(() => {
 		renderTaskList(state, elems);
 		//updateAllTasks(state);

 	});
 	return template;
}

const renderTaskList = (state, elems) => {
	let resHtml = state.tasks.map((task, idx) => {
		return renderTask(state, elems, task.name, task.totalTime, task.project, idx)
	});

	elems.taskList.html(resHtml.reverse());
}

renderProjectOptions = (state, elems) => {
	resHtml = state.projects
	.filter(project => project !== "")
	.map((project) => {
		return `<option value="${project}">${project}</option>`;
	});

	elems.projectSelect.html(resHtml);
}

const initProjectSubmitHandler = (state,elems) => {
	$(elems.newProject).on("submit", (e) => {
		e.preventDefault();
		let name;
		name = elems.projectName.val();
		state.projects.push(name);
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
		elems.projectName.val("");
		//saveTask(state.tasks[state.tasks.length-1]);
		//renderTaskList(state, elems);
	});
}

const initTaskSubmitHandler = (state, elems) => {
	$(elems.newTask).on("submit", (e) => {
		e.preventDefault();

		const name = elems.taskName.val();
		const selectedProject = $("#selectProject :selected").text();
		const taskProject = selectedProject === "none" ? undefined : selectedProject;
		state.tasks.push(new Task(name, 0, taskProject));
		//saveTask(state.tasks[state.tasks.length-1]);
		renderTaskList(state, elems);
		elems.taskName.val("");
	});
}


const main = () => {

	const elems = {
		newProject: $("#newProject"),
		projectSelect: $("#selectProject"),
		newTask : $("#newTask"),
		taskList: $("#taskList"),
		projectName: $("#projectName"),
		taskName:$("#taskName")
	};

	//getTasks(state, elems);
	renderProjectOptions(state, elems);
	renderProjectList(state, elems);
	renderTaskList(state, elems);
	initProjectSubmitHandler(state, elems);
	initTaskSubmitHandler(state, elems);

}

$(main);
