
const state = {
	projects: []
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

const renderProject = (state, elems, name, total, parent, idx) => {
 let project = state.projects[idx];
 let template = $(
	`<div id="wrapper">
		<div class="timeMod well">
				<div class="topRow">
					<span class="title">${name}</span>
					<span class="acctotal">${total.toFixed(2)}</span>
					<div class="form-group sell">
						<label for="sell"></label>
						<select name="" id="sell" class="form-control">
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
						</select>
					</div>
				</div>
			<div class="btn-group timeButtons">
				<button type="button" class="js-btn5 btn btn-primary">5</button>
				<button type="button" class="js-btn15 btn btn-primary">15</button>
				<button type="button" class="js-btn25 btn btn-primary" value="25">25</button>
				<input type="text" name="" id="customInput" class="customInput form-control">
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
 		console.log("add time 5" , moment().format("h:mm:ss"));
 	});

 	template.find(".js-btn15").click( () => {
		project.addTime(15);
 		console.log("add time 15" , moment().format("h:mm:ss"));


 	});

 	template.find(".js-btn25").click( () => {
 		project.addTime(25);
 		console.log("add time 25" , moment().format("h:mm:ss"));


 	});

 	template.find("#js-reset").click( () => {
 		project.reset();
 	});

 	template.find("#customInput").on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
 			project.addTime(Number($("#customInput").val()));
 			console.log((new Date()).toDateString());
 			renderList(state, elems);
 			updateAll(state);
 			//this.reset;
 		}
 	});

 	template.find("#js-undo").click( () => {
 		project.undo();
 		renderList(state, elems);
 	});

 	template.find("#js-delete").click( () => {
 		deleteProj(state, idx);
 	});

 	template.find(".btn").click(() => {
 		renderList(state, elems);
 		updateAll(state);

 	});
 	return template;
}

const startTimer = (t) => {
 const intervalSound = new Audio("http://cd.textfiles.com/999wavs/WAVS_T/TUERKLIN.WAV");
 const endSound= new Audio("http://www.deskalarm.com/sounds/clockbell.wav");
 const alertInterval = () => intervalSound.play();
 const alertEnd = () => endSound.play();

	intervalTimer(t, 5, alertEnd, alertInterval)

}

const renderList = (state, elems) => {
	let resHtml = state.projects.map((proj, idx) => {

		return renderProject(state, elems, proj.name, proj.total, proj.parent, idx)
	});

	elems.projectList.html(resHtml);
}

function Parent (name, total) {
 	this.name = name;
 	this.total = Number(total);

}

Parent.prototype.addTime = function(t) {

	this.total += toHours(t);
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

Proj.prototype.parentAddTime = function() {

}

Proj.prototype.addTime = function(t) {
	console.log(toHours(t));
	this.total += toHours(t);
	if (this.hist) {
		 this.hist.push(this.total);
		 this.histCount = 0;
	}
	startTimer(t);

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

const initSubmitHandler = (state, elems) => {
	$(elems.newProj).on("submit", (e) => {
		e.preventDefault();
		let name;
		name = $("#projName").val();
		state.projects.push(new Proj(name, 0));
		console.log();
		saveProject(state.projects[state.projects.length-1]);
		renderList(state, elems);
	});
}
const saveProject = (project) => {
	console.log(project);
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
		/*state.projects = data;
		console.log(state.projects);*/

		state.projects = data.map( project => {
		return new Proj(project.name, project.total, project.hist, project.parent)
		});
		renderList(state, elems);
	}
	$.get("/getData", undefined, callback);
}
const main = () => {
	const elems = {
		newProj : $("#newProj"),
		projectList: $("#projectList")
	}
	setState(state, elems);
	initSubmitHandler(state, elems)

}

$(main);
