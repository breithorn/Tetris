
var NUMBER_ROWS = 20;
var NUMBER_COLUMNS = 10;
var PREVIEW_NUMBER_ROWS = 6;
var PREVIEW_NUMBER_COLUMNS = 10;
var SCORE_CLEARED_LINE = 2000;
var SCORE_DROP_TOP = 200;

var playing = false;
var paused = false;
var has_block = false;
var highscore = 0;
var score = 0;
var move_score = SCORE_DROP_TOP;
var level = 1;

// Origin of currently played block
var x0;
var y0;

// The block that the player is currently moving
var block = null;
var block_color = "";
var may_rotate = true;

// Fixed block properties
var block0 = null;
var block0_color = "";
var block0_may_rotate = true;

document.onkeydown = handleKey;

//-----------------------------------------------------------------------------
//
function init()
{
	createPlayArea();
	createPreviewArea();
	score = 0;
	highscore = 0;
	updateScores();
	document.getElementById("container_clickstart").style.display = "block";
}

//-----------------------------------------------------------------------------
//
function createPlayArea()
{
	var arena = document.getElementById("arena");
	for (var y = 0; y < NUMBER_ROWS; y++) {
		var row = arena.insertRow(-1);
		for (var x = 0; x < NUMBER_COLUMNS; x++) {
			var cell = row.insertCell(-1);
			cell.className = "cell";
			cell.innerHTML = "&nbsp;";
		}
	}
}

//-----------------------------------------------------------------------------
//
function clearPlayArea()
{
	for (var y = 0; y < NUMBER_ROWS; y++) {
		for (var x = 0; x < NUMBER_COLUMNS; x++) {
			resetCell(x, y);
		}
	}
}

//-----------------------------------------------------------------------------
//
function createPreviewArea()
{
	var preview = document.getElementById("preview");
	for (var y = 0; y < PREVIEW_NUMBER_ROWS; y++) {
		var row = preview.insertRow(-1);
		for (var x = 0; x < PREVIEW_NUMBER_COLUMNS; x++) {
			var cell = row.insertCell(-1);
			cell.className = "cell";
			cell.innerHTML = "&nbsp;";
		}
	}
}

//-----------------------------------------------------------------------------
//
function clearPreviewArea()
{
	var preview = document.getElementById("preview");
	for (var y = 0; y < PREVIEW_NUMBER_ROWS; y++) {
		for (var x = 0; x < PREVIEW_NUMBER_COLUMNS; x++) {
			var cell = preview.rows[y].cells[x];
			cell.style.backgroundColor = "lightsteelblue";
		}
	}
}

//-----------------------------------------------------------------------------
//
function handleKey(e)
{
	if (!e) e = event;
	var key = e.keyCode;

	if (key == 37)							// arrow left
	{
		moveBlockLeft();
	}
	else if (key == 39)						// arrow right
	{
		moveBlockRight();
	}
	else if ((key == 40) || (key == 32))	// arrow down or space
	{
		dropBlock();
	}
	else if ((key == 38) || (key == 90))	// arrow up or z
	{
		rotateCW();
	}
	else if (key == 88)						// x
	{
		rotateCCW();
	}
	else if (key == 80)						// p
	{
		togglePause();
	}
	return false;
}

//-----------------------------------------------------------------------------
//
function previewBlock()
{
	var preview = document.getElementById("preview");
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			var cell = preview.rows[y].cells[x+2];
			cell.style.backgroundColor = (block0[y][x] == 1) ? block0_color : "lightsteelblue";
		}
	}
}

//-----------------------------------------------------------------------------
//
function updateScores()
{
	document.getElementById("container_score").innerHTML = formatNumber(score);
	document.getElementById("container_highscore").innerHTML = formatNumber(highscore);
}

//-----------------------------------------------------------------------------
//
function formatNumber(n)
{
	var result = "";
	var s = new String(n);
	for (var i = s.length - 1; i >= 0; i--) {
		result += s.charAt(s.length - i - 1);
		if (i % 3 == 0) result += " ";
	}
	return result;
}

//-----------------------------------------------------------------------------
//
function updateLevel()
{
	document.getElementById("container_level").innerHTML = "<br/>Level " + level;
}

//-----------------------------------------------------------------------------
//
function startGame()
{
	var start = true;
	if (playing) {
		var result = confirm("Quit current game and start a new one?");
		if (!result) return;
	}

	document.getElementById("container_clickstart").style.display = "none";
	document.getElementById("container_paused").style.display = "none";
	document.getElementById("container_level").style.display = "block";

	document.getElementById("preview").disabled = true;
	document.getElementById("button_pause").disabled = false;
	document.getElementById("button_exit").disabled = false;

	playing = true;
	paused = false;
	has_block = false;

	block = new Array(5);
	block0 = new Array(5);
	for (var y = 0; y < 5; y++) {
		block[y] = new Array(0,0,0,0,0);
		block0[y] = new Array(0,0,0,0,0);
	}

	score = 0;
	updateScores();

	clearPlayArea();
	level = 1;
	updateLevel();

	chooseNextBlock();
	clearPreviewArea();
	previewBlock();

	loop();
}

//-----------------------------------------------------------------------------
//
function quitGame()
{
	playing = false;
	paused = true;
	togglePause();
	document.getElementById("button_new").disabled = false;
	document.getElementById("button_pause").disabled = true;
	document.getElementById("button_exit").disabled = true;
	if (score > highscore) {
		highscore = score;
		updateScores();
	}
	score = 0;
	updateScores();
	clearPlayArea();
	clearPreviewArea();
	document.getElementById("container_clickstart").style.display = "block";
	document.getElementById("container_paused").style.display = "none";
	document.getElementById("container_level").style.display = "none";
}

//-----------------------------------------------------------------------------
//
function togglePause()
{
	if (!playing) return;
	var container_paused = document.getElementById("container_paused");
	var button_pause = document.getElementById("button_pause");
	if (paused) {
		container_paused.style.display = "none";
		button_pause.value = "Pause";
		paused = false;
		loop();
	} else {
		container_paused.style.display = "block";
		button_pause.value = "Continue";
		paused = true;
	}
}

//-----------------------------------------------------------------------------
//
function loop()
{
	if (!playing) return;
	if (paused) return;

	if (score > 10000) level = 2;
	if (score > 20000) level = 3;
	if (score > 40000) level = 4;
	if (score > 60000) level = 5;
	if (score > 80000) level = 6;
	if (score > 100000) level = 7;
	if (score > 150000) level = 8;
	if (score > 200000) level = 9;
	if (score > 500000) level = 10;

	updateLevel();

	if (!has_block) {
		x0 = 3;
		y0 = 0;
		initializeBlock();
		drawBlock();
		chooseNextBlock();
		clearPreviewArea();
		previewBlock();
		has_block = true;
		move_score = SCORE_DROP_TOP * level;
	} else {
		move_score -= 10;
		var dropped = moveBlockDown();
		if (dropped) {
			checkLines();
			if (hasReachedTop()) {
				quitGame();
				return;
			}
			has_block = false;
		}
	}

	var timeout = (has_block) ? (1500/level) : 0;
	setTimeout("loop();", timeout);
}

//-----------------------------------------------------------------------------
//
function checkLines()
{
	var arena = document.getElementById("arena");
	var number_lines = 0;
	for (var y = 0; y < NUMBER_ROWS; y++) {
		var full = true;
		for (var x = 0; x < NUMBER_COLUMNS; x++) {
			var cell = arena.rows[y].cells[x];
			if (cell.empty) {
				full = false;
				break;
			}
		}
		if (full) {
			moveDownLinesAbove(y);
			number_lines++;
		}
	}
	if (number_lines > 0) {
		score += SCORE_CLEARED_LINE * level * number_lines * 2;
		updateScores();
	}
}

//-----------------------------------------------------------------------------
//
function moveDownLinesAbove(line)
{
	var arena = document.getElementById("arena");
	for (var y = line; y > 0; y--) {
		for (var x = 0; x < NUMBER_COLUMNS; x++) {
			resetCell(x,y);
			var cell = arena.rows[y].cells[x];
			var cell_above = arena.rows[y-1].cells[x];
			cell.empty = cell_above.empty;
			cell.style.backgroundColor = cell_above.style.backgroundColor;
		}
	}
}

//-----------------------------------------------------------------------------
//
function hasReachedTop()
{
	var arena = document.getElementById("arena");
	for (var y = 0; y < NUMBER_ROWS; y++) {
		var any_block = false;
		for (var x = 0; x < NUMBER_COLUMNS; x++) {
			var cell = arena.rows[y].cells[x];
			if (!cell.empty) any_block = true;
		}
		if (any_block) break;
	}
	return (y == 1);
}

//-----------------------------------------------------------------------------
//
function chooseNextBlock()
{
	var i = Math.floor(Math.random() * 7);
	if (i == 0)	setBlock_I();
	if (i == 1)	setBlock_T();
	if (i == 2)	setBlock_O();
	if (i == 3)	setBlock_L();
	if (i == 4)	setBlock_J();
	if (i == 5)	setBlock_S();
	if (i == 6)	setBlock_Z();
}

//-----------------------------------------------------------------------------
//
function initializeBlock()
{
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			block[y][x] = block0[y][x];
		}
	}
	block_color = block0_color;
	may_rotate = block0_may_rotate;
}

//-----------------------------------------------------------------------------
//
function resetCell(x, y)
{
	var arena = document.getElementById("arena");
	var cell = arena.rows[y].cells[x];
	cell.empty = true;
	cell.moving_block = false;
	cell.style.backgroundColor = "lightsteelblue";
}

//-----------------------------------------------------------------------------
//
function drawBlock()
{
	var arena = document.getElementById("arena");
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			if (block[y][x] == 1) {
				var cell = arena.rows[y + y0].cells[x + x0];
				cell.empty = false;
				cell.moving_block = true;
				cell.style.backgroundColor = block_color;
			}
		}
	}
}

//-----------------------------------------------------------------------------
//
function undrawBlock()
{
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			if (block[y][x] == 1) {
				resetCell(x + x0, y + y0);
			}
		}
	}
}

//-----------------------------------------------------------------------------
//
function fixateBlock()
{
	var arena = document.getElementById("arena");
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			if (block[y][x] == 1) {
				var cell = arena.rows[y + y0].cells[x + x0];
				cell.moving_block = false;
			}
		}
	}
}

//-----------------------------------------------------------------------------
//
function movePossible(direction)
{
	var arena = document.getElementById("arena");
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			if (block[y][x] == 1) {
				var x1 = x + x0;
				var y1 = y + y0;

				if ((direction == "down") && (y1 == NUMBER_ROWS - 1)) return false;
				if ((direction == "left") && (x1 == 0)) return false;
				if ((direction == "right") && (x1 == NUMBER_COLUMNS - 1)) return false;
		
				var xd = 0;
				var yd = 0;
				if (direction == "down") yd = 1;
				if (direction == "left") xd = -1;
				if (direction == "right") xd = 1;
		
				var cell = arena.rows[y1 + yd].cells[x1 + xd];
				if (cell.empty) {
					//do nothing
				} else {
					if (!cell.moving_block) {
						return false;
					}
				}
			}
		}
	}
	return true;
}

//-----------------------------------------------------------------------------
//
function moveBlockDown()
{
	if (!playing) return;
	if (paused) return;
	if (!has_block) return;

	if (movePossible("down")) {
		undrawBlock();
		y0++;
		drawBlock();
		return false;
	} else {
		fixateBlock();
		return true;
	}
}

//-----------------------------------------------------------------------------
//
function moveBlockLeft()
{
	if (!playing) return;
	if (paused) return;
	if (!has_block) return;

	if (movePossible("left")) {
		undrawBlock();
		x0--;
		drawBlock();
	}
}

//-----------------------------------------------------------------------------
//
function moveBlockRight()
{
	if (!playing) return;
	if (paused) return;
	if (!has_block) return;

	if (movePossible("right")) {
		undrawBlock();
		x0++;
		drawBlock();
	}
}

//-----------------------------------------------------------------------------
//
function canRotate()
{
	//todo
	return may_rotate;
}

//-----------------------------------------------------------------------------
//
function rotateCW()
{
	if ((playing) && (!paused) && (has_block) && (canRotate())) {
		undrawBlock();
		var new_block = new Array(5);

		//rotate
		for (var y = 0; y < 5; y++) {
			new_block[y] = new Array(0,0,0,0,0);
			for (var x = 0; x < 5; x++) {
				var x1 = 4 - y;
				var y1 = x;
				new_block[y][x] = block[y1][x1];
			}
		}

		//copy
		for (var y = 0; y < 5; y++) {
			for (var x = 0; x < 5; x++) {
				block[y][x] = new_block[y][x];
			}
		}

		x0 = Math.max(x0, 0);
		x0 = Math.min(x0, NUMBER_COLUMNS - 5);
		drawBlock();
	}
}

//-----------------------------------------------------------------------------
//
function rotateCCW()
{
	if ((playing) && (!paused) && (has_block) && (canRotate())) {
		undrawBlock();
		var new_block = new Array(5);

		//rotate
		for (var y = 0; y < 5; y++) {
			new_block[y] = new Array(0,0,0,0,0);
			for (var x = 0; x < 5; x++) {
				var x1 = y;
				var y1 = 4 - x;
				new_block[y][x] = block[y1][x1];
			}
		}

		//copy
		for (var y = 0; y < 5; y++) {
			for (var x = 0; x < 5; x++) {
				block[y][x] = new_block[y][x];
			}
		}

		x0 = Math.max(x0, 0);
		x0 = Math.min(x0, NUMBER_COLUMNS - 5);
		drawBlock();
	}
}

//-----------------------------------------------------------------------------
//
function dropBlock()
{
	if (!playing) return;
	if (paused) return;
	if (!has_block) return;

	var block_released = false;
	while (!block_released) {
		block_released = moveBlockDown();
	}
	checkLines();
	if (move_score > 0) {
		score += move_score;
		updateScores();
	}
	has_block = false;
}

//-----------------------------------------------------------------------------
//
function setBlock_I()
{
	block0_color = "crimson";
	block0 = new Array(5);
	block0[0] = new Array(0,0,0,0,0);
	block0[1] = new Array(0,0,1,0,0);
	block0[2] = new Array(0,0,1,0,0);
	block0[3] = new Array(0,0,1,0,0);
	block0[4] = new Array(0,0,1,0,0);
	block0_may_rotate = true;
}

//-----------------------------------------------------------------------------
//
function setBlock_T()
{
	block0_color = "gray";
	block0 = new Array(5);
	block0[0] = new Array(0,0,0,0,0);
	block0[1] = new Array(0,0,0,0,0);
	block0[2] = new Array(0,1,1,1,0);
	block0[3] = new Array(0,0,1,0,0);
	block0[4] = new Array(0,0,0,0,0);
	block0_may_rotate = true;
}

//-----------------------------------------------------------------------------
//
function setBlock_O()
{
	block0_color = "cyan";
	block0 = new Array(5);
	block0[0] = new Array(0,0,0,0,0);
	block0[1] = new Array(0,1,1,0,0);
	block0[2] = new Array(0,1,1,0,0);
	block0[3] = new Array(0,0,0,0,0);
	block0[4] = new Array(0,0,0,0,0);
	block0_may_rotate = false;
}

//-----------------------------------------------------------------------------
//
function setBlock_L()
{
	block0_color = "yellow";
	block0 = new Array(5);
	block0[0] = new Array(0,0,1,0,0);
	block0[1] = new Array(0,0,1,0,0);
	block0[2] = new Array(0,0,1,1,0);
	block0[3] = new Array(0,0,0,0,0);
	block0[4] = new Array(0,0,0,0,0);
	block0_may_rotate = true;
}

//-----------------------------------------------------------------------------
//
function setBlock_J()
{
	block0_color = "magenta";
	block0 = new Array(5);
	block0[0] = new Array(0,0,1,0,0);
	block0[1] = new Array(0,0,1,0,0);
	block0[2] = new Array(0,1,1,0,0);
	block0[3] = new Array(0,0,0,0,0);
	block0[4] = new Array(0,0,0,0,0);
	block0_may_rotate = true;
}

//-----------------------------------------------------------------------------
//
function setBlock_S()
{
	block0_color = "blue";
	block0 = new Array(5);
	block0[0] = new Array(0,0,0,0,0);
	block0[1] = new Array(0,0,0,0,0);
	block0[2] = new Array(0,0,1,1,0);
	block0[3] = new Array(0,1,1,0,0);
	block0[4] = new Array(0,0,0,0,0);
	block0_may_rotate = true;
}

//-----------------------------------------------------------------------------
//
function setBlock_Z()
{
	block0_color = "seagreen";
	block0 = new Array(5);
	block0[0] = new Array(0,0,0,0,0);
	block0[1] = new Array(0,0,0,0,0);
	block0[2] = new Array(0,1,1,0,0);
	block0[3] = new Array(0,0,1,1,0);
	block0[4] = new Array(0,0,0,0,0);
	block0_may_rotate = true;
}
