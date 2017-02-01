

const state = {
	projects: ["none"],
	tasks: []
}

const startTimer = (t) => {
	//droid cascade
 const intervalSound = new Audio("./sounds/intervalSound.mp3");
 const endSound = new Audio("./sounds/endSound.mp3");

 const alertInterval = (interval) => {
	 console.log(interval);
	 for (let i = 0; i < 5; i++) {
		 intervalSound.play();
	 }
 }
 const alertEnd = () => endSound.play();

 intervalTimer(t, 5, alertEnd, alertInterval)
}

const toHours = (min) => {
	return Number((Number(min)/60).toFixed(2));
}

const deleteTask = (state, idx) => {
	$.ajax({
			url: "/tasks",
			type: "DELETE",
			data: state.tasks[idx]
		});
	state.tasks.splice(idx, 1);
}

const deleteProject = (projectName) => {

	state.tasks.forEach(task => {
		if (task.project === projectName) {
			task.project = "";
			console.log(task);
		}
	});
	state.projects = state.projects.filter(project => {
		return project !== projectName;
	});
	console.log(state.projects);
	renderProjects();
	renderProjectOptions();
	updateAll(state);
}

const getProjectValues = () => {
	const obj = {};
		state.tasks.forEach((task) => {
			obj[task.project] ? obj[task.project] += task.totalTime : obj[task.project] = task.totalTime;
		});
		return obj;
}

const renderOneProject = (projectName, value) => {
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
		deleteProject(projectName);
	});
	return resHtml;
}

const renderProjects = () => {
	const projects = getProjectValues();
	const resHtml = Object
		.keys(projects)
		.filter(key => key !== "none" && key !== "")
		.map(key => {
		return renderOneProject(key, projects[key]);
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
 		console.log(`add time 5 to ${name}` , moment().format("h:mm:ss"));
 	});

 	template.find(".js-btn15").click( () => {
		task.addTime(15);
 		console.log(`add time 15 to ${name}` , moment().format("h:mm:ss"));


 	});

 	template.find(".js-btn25").click( () => {
 		task.addTime(25);
 		console.log(`add time 25 to ${name}` , moment().format("h:mm:ss"));


 	});

 	template.find("#js-reset").click( () => {
 		task.reset();
 	});

 	template.find(`#customInput${idx}`).on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
			const input = Number($(`#customInput${idx}`).val());
			console.log(input);
 			task.addTime(input);
 			console.log(`add time ${input} to ${name}`, moment().format("h:mm:ss"));
 			renderList(state, elems);
 			updateAll(state);
 			//this.reset;
 		}
 	})

 	template.find("#js-undo").click( () => {
 		task.undo();
 		renderList(state, elems);
 	})

 	template.find("#js-delete").click( () => {
 		deleteTask(state, idx);
 	});

 	template.find(".btn").click(() => {
 		renderList(state, elems);
 		updateAll(state);

 	});
 	return template;
}

const renderList = (state, elems) => {
	let resHtml = state.tasks.map((task, idx) => {
		return renderTask(state, elems, task.name, task.totalTime, task.project, idx)
	});

	elems.taskList.html(resHtml.reverse());
}

renderProjectOptions = () => {
	resHtml = state.projects
	.filter(project => project !== "")
	.map((project) => {
		return `<option value="${project}">${project}</option>`;
	});

	$("#selectProject").html(resHtml);
}



function Task(name, totalTime, hist, project) {
	this.name = name;
	this.project = project;
	this.totalTime = Number(totalTime);
	this.histCount = 0;
	if (hist) {
		this.hist = history;
	} else {
		this.hist = [];
	}
}


Task.prototype.addTime = function(t) {
	this.totalTime += toHours(t);

	if (this.hist) {
		 this.hist.push(this.totalTime);
		 this.histCount = 0;
	}

	if(this.projectAddTime)
  	this.projectAddTime(t);

	startTimer(t);
	renderProjects()
}

Task.prototype.reset = function() {
	this.totalTime = 0;
}

Task.prototype.undo = function() {
		if (this.hist) {
			if (this.hist.length > 1 && this.hist.length-this.histCount-2 >= 0) {
				this.totalTime = this.hist[this.hist.length-this.histCount-2];
				this.histCount++;
			}

			if (this.hist.length > 20) {
				this.hist.splice(0,1);
			}
		}
}

const initProjectsubmitHandler = (state,elems) => {
	$(elems.newProject).on("submit", (e) => {
		e.preventDefault();
		let name;
		name = $("#projectName").val();
		state.projects.push(name);
		renderProjectOptions(state, elems);
		//saveTask(state.tasks[state.tasks.length-1]);
		//renderList(state, elems);
	});
}

const initTaskSubmitHandler = (state, elems) => {
	$(elems.newTask).on("submit", (e) => {
		e.preventDefault();
		let name, project;
		name = $("#taskName").val();
		project = $("#selectProject :selected").text();
		state.tasks.push(new Task(name, 0, null, project));
		saveTask(state.tasks[state.tasks.length-1]);
		renderList(state, elems);
	});
}

const saveTask = (task) => {
	const callback = () => console.log("Task Saved");
	const postObj = {
		"name": task.name,
		"project": task.project,
		"totalTime": task.totalTime
	}
	console.log(postObj);
	$.post("/tasks", postObj, callback, "json");
}

const updateAll = (state) => {
	state.tasks.forEach((task) => {
		$.ajax({
			url: "/tasks",
			type: "PUT",
			data: task,
			success: (data) => {console.log("save successful")}
		});
	});
}

const setState = (state, elems) => {
	const callback = (data) => {

		state.tasks = data.tasks.map( task => {

			if(state.projects.indexOf(task.project) === -1)
				state.projects.push(task.project);

			return new Task(task.name, task.totalTime, task.hist, task.project)
		});

		renderList(state, elems);
		renderProjectOptions(state, elems);
		renderProjects();
	}
	$.get("/tasks", undefined, callback);
}
const main = () => {
	const elems = {
		newProject: $("#newProject"),
		projectselect: $("#selectProject"),
		newTask : $("#newTask"),
		taskList: $("#taskList")
	};

	setState(state, elems);
	initProjectsubmitHandler(state, elems);
	initTaskSubmitHandler(state, elems);

}

$(main);
