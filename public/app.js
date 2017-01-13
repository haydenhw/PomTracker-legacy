
const state = {
	parents: ["none"],
	projects: []
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

const deleteProj = (state, idx) => {
	$.ajax({
			url: "/delete",
			type: "DELETE",
			data: state.projects[idx]
		});
	state.projects.splice(idx, 1);
}

const deleteParent = (parentName) => {

	state.projects.forEach(proj => {
		if (proj.parent === parentName) {
			proj.parent = "";
			console.log(proj);
		}
	});
	state.parents = state.parents.filter(parent => {
		return parent !== parentName;
	});
	console.log(state.parents);
	renderParents();
	renderParentOptions();
	updateAll(state);
}

const getParentValues = () => {
	const obj = {};
		state.projects.forEach((proj) => {
			obj[proj.parent] ? obj[proj.parent] += proj.total : obj[proj.parent] = proj.total;
		});
		return obj;
}

const renderOneParent = (parentName, value) => {
	const resHtml = $(
		`<div>
			<div id="parentWrapper">
				<span class="parent">${parentName}</span>
				<span class="parentValue">${value}</span>
				<button id="deleteParent" class="btn btn-outline-secondary">X</button>
			</div>
		</div>`
	);

	resHtml.find("#deleteParent").click(() => {
		deleteParent(parentName);
	});
	return resHtml;
}

const renderParents = () => {
	const parents = getParentValues();
	const resHtml = Object
		.keys(parents)
		.filter(key => key !== "none" && key !== "")
		.map(key => {
		return renderOneParent(key, parents[key]);
	});
	$("#parents").html(resHtml);
}

const renderProject = (state, elems, name, total, parent, idx) => {
 let project = state.projects[idx];
 let template = $(
	`<div id="wrapper">
		<div class="timeMod well">
				<div class="topRow">
					<span class="title">${name}</span>
					<span class="acctotal">${total.toFixed(2)}</span>
					<span class="parent">${parent}<span>
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
 		project.addTime(5);
 		console.log(`add time 5 to ${name}` , moment().format("h:mm:ss"));
 	});

 	template.find(".js-btn15").click( () => {
		project.addTime(15);
 		console.log(`add time 15 to ${name}` , moment().format("h:mm:ss"));


 	});

 	template.find(".js-btn25").click( () => {
 		project.addTime(25);
 		console.log(`add time 25 to ${name}` , moment().format("h:mm:ss"));


 	});

 	template.find("#js-reset").click( () => {
 		project.reset();
 	});

 	template.find(`#customInput${idx}`).on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
			const input = Number($(`#customInput${idx}`).val());
			console.log(input);
 			project.addTime(input);
 			console.log(`add time ${input} to ${name}`, moment().format("h:mm:ss"));
 			renderList(state, elems);
 			updateAll(state);
 			//this.reset;
 		}
 	})

 	template.find("#js-undo").click( () => {
 		project.undo();
 		renderList(state, elems);
 	})

 	template.find("#js-delete").click( () => {
 		deleteProj(state, idx);
 	});

 	template.find(".btn").click(() => {
 		renderList(state, elems);
 		updateAll(state);

 	});
 	return template;
}

const renderList = (state, elems) => {
	let resHtml = state.projects.map((proj, idx) => {
		return renderProject(state, elems, proj.name, proj.total, proj.parent, idx)
	});

	elems.projectList.html(resHtml.reverse());
}

renderParentOptions = () => {
	resHtml = state.parents
	.filter(parent => parent !== "")
	.map((parent) => {
		return `<option value="${parent}">${parent}</option>`;
	});

	$("#selectParent").html(resHtml);
}



function Proj(name, total, hist, parent) {
	this.name = name;
	this.parent = parent;
	this.total = Number(total);
	this.histCount = 0;
	if (hist) {
		this.hist = history;
	} else {
		this.hist = [];
	}

}

Proj.prototype.parentAddTime = function(t) {
	this.parent.time += t;
}

Proj.prototype.addTime = function(t) {
	this.total += toHours(t);

	if (this.hist) {
		 this.hist.push(this.total);
		 this.histCount = 0;
	}

	if(this.parentAddTime)
  	this.parentAddTime(t);

	startTimer(t);
	renderParents()
}

Proj.prototype.reset = function() {
	this.total = 0;
}

Proj.prototype.undo = function() {
		if (this.hist) {
			if (this.hist.length > 1 && this.hist.length-this.histCount-2 >= 0) {
				this.total = this.hist[this.hist.length-this.histCount-2];
				this.histCount++;
			}

			if (this.hist.length > 20) {
				this.hist.splice(0,1);
			}
		}
}

const initParentSubmitHandler = (state,elems) => {
	$(elems.newParent).on("submit", (e) => {
		e.preventDefault();
		let name;
		name = $("#parentName").val();
		state.parents.push(name);
		renderParentOptions(state, elems);
		//saveProject(state.projects[state.projects.length-1]);
		//renderList(state, elems);
	});
}

const initTaskSubmitHandler = (state, elems) => {
	$(elems.newProj).on("submit", (e) => {
		e.preventDefault();
		let name, parent;
		name = $("#projName").val();
		parent = $("#selectParent :selected").text();
		state.projects.push(new Proj(name, 0, null, parent));
		console.log(state.projects);
		saveProject(state.projects[state.projects.length-1]);
		renderList(state, elems);
	});
}
const saveProject = (project) => {
	const callback = () => console.log("Project Saved");

	$.post("/save", project, callback, "json");
}

const updateAll = (state) => {
	state.projects.forEach((proj) => {
		$.ajax({
			url: "/update",
			type: "PUT",
			data: proj,
			success: (data) => {console.log("save successful")}
		});
	});
}

const setState = (state, elems) => {
	const callback = (data) => {
		state.projects = data.map( project => {

			if(state.parents.indexOf(project.parent) === -1)
				state.parents.push(project.parent);

			return new Proj(project.name, project.total, project.hist, project.parent)
		});

		renderList(state, elems);
		renderParentOptions(state, elems);
		renderParents();
	}
	$.get("/getData", undefined, callback);
}
const main = () => {
	const elems = {
		newParent: $("#newParent"),
		parentSelect: $("#selectParent"),
		newProj : $("#newProj"),
		projectList: $("#projectList")
	};

	setState(state, elems);
	initParentSubmitHandler(state, elems);
	initTaskSubmitHandler(state, elems);

}

$(main);
