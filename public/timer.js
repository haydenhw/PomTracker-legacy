const convert = seconds => {
	const timeObj = {
		min: Math.floor(seconds / 60 + " "),
		sec: seconds % 60 + " "
	}
	return(timeObj);
}

const renderTime = time => {
	$(".js-min").text(time.min);
	$(".js-sec").text(time.sec);
}

const intervalTimer =
	(minutes, interval, endCallback, intervalCallback, renderCallback) => {
	let seconds = minutes * 60;
	console.log("Timer Running...");

	const countDown = setInterval(() => {
		if (seconds <= 0) {
			clearInterval(countDown);
			endCallback();
		}
		if (seconds/60 % interval === 0) {
			if (intervalCallback)
				intervalCallback(seconds/60);
		}
		seconds--;
		if (seconds > 0) {
			if(renderCallback)
				renderCallback();
		}
	}, 1000);
}

/*
var action = prompt("Type 's' to log another pomodoro");
if (action === "s") {
	upTime("coding", 25)
	reduceTime (24.5);
}
console.log(action);*/

const initHandleBtn25 = el => {
	el.btn25.on("click", e => {
		e.preventDefault();
		//let time = el.input.val();
		let time = 24.5;
		reduceTime(time);
		upTime("coding",25)
		this.reset;
	});
}

const initTimer = () => {
	const el = {
		form: $("form"),
		input: $(".js-timeInput"),
		btn25: $("#btn25")
	}

	initHandleBtn25(el);
	//For Testing
	}
