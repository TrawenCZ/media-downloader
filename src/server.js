const { execSync } = require('child_process');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const ip = require('ip');
const fs = require('fs');
const cors =  require('cors');

dotenv.config();
const app = express();
const PORT = process.env?.PORT || 3000;
process.env.PORT = PORT;
const ipAddress = ip.address();
process.env.IP = ipAddress;

fs.writeFileSync(path.join(__dirname, "..", "webshare-downloader-frontend", ".env"), "REACT_APP_HOST_ADDRESS=" + "http://" + ipAddress + ":" + PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


if (!fs.existsSync(path.join(__dirname, "..", "webshare-downloader-frontend", "build"))) {
	console.log("Please build frontend first, by running 'npm run build' in webshare-downloader-frontend folder.");
	return;
}

var activeFiles = [];
function loadActiveFiles() {
	activeFiles = [];
	for (const file of fs.readdirSync(path.join(__dirname, "storage", "progressLogs"))) {
		if (file === ".gitkeep") continue;
		const fileName = file.replace(".log", "");
		const progressAndRemainingTime = loadProgressAndRemainingTime(fileName);
		if (progressAndRemainingTime.progress === -1) continue;
		activeFiles.push({ "fileName": fileName, "progress": progressAndRemainingTime.progress, "remainingTime": progressAndRemainingTime.remainingTime });
	}
}
loadActiveFiles();

app.use(express.static(path.join(__dirname, '..', 'webshare-downloader-frontend', 'build')));
app.use(cors());

app.get('/', (req, res) => {
	loadActiveFiles();
    res.sendFile(path.resolve(__dirname, '..', 'webshare-downloader-frontend', 'build', 'index.html'));
}
);

app.post('/api/now', (req, res) => {
	const link = req.body.link
	if (link.split() > 1) {
		res.status(400).send("Only one link is allowed.")
		return;
	}
	if (activeFiles.find((file) => file.fileName === link.split("/").pop())) {
		res.status(400).send("File is already downloading.")
		return;
	}
	try {
		execSync("python download_now.py " + link, {stdio: 'inherit'})
		activeFiles.push({ "fileName": link.split("/").pop(), "progress": 0})
	} catch (error) {
		res.status(500).send("Error occurred while downloading file from link '" + link + "'.")
		return;
	}
	res.send("Successfuly downloading file from link '" + link + "'.")
})

app.post('/api/queue', (req, res) => {
	const link = req.body.link
	if (link.split() > 1) {
		res.status(400).send("Only one link is allowed.")
		return;
	}
	try {
		execSync("python download_in_queue.py " + link, {stdio: 'inherit'})
	} catch (error) {
		res.status(500).send("Error occurred while downloading file from link '" + link + "'.")
		return;
	}
	res.send("Successfuly added to queue '" + link + "'.")
})

app.get('/api/downloads', (req, res) => {
	loadActiveFiles();
	res.send(activeFiles)
})

function loadProgressAndRemainingTime(fileName) {
	try {
		const data = execSync("tail -n 3 " + path.join(__dirname, "storage", "progressLogs", `${fileName}.log`)).toString();
		return {
			progress: parseInt(data.split(" ").findLast((item) => item.includes("%")).replace("%", "")),
	 		remainingTime: data.split("\n").at(-2).split(" ").at(-1) };
	} catch (error) {
		return {
			progress: -1,
			remainingTime: "N/A"
		};
	}
}


app.get('/api/downloads/:fileName', (req, res) => {
	const fileName = req.params.fileName;
	const newProgressAndRemainingTime = loadProgressAndRemainingTime(fileName);
	if (newProgressAndRemainingTime.progress === -1) {
		res.status(404).send("File not found");
		return;
	}

	activeFiles = activeFiles.map((file) => file.fileName === fileName ? 
								{"fileName": fileName, "progress": newProgressAndRemainingTime.progress, "remainingTime": newProgressAndRemainingTime.remainingTime} 
								: file);
	res.send({ "progress": newProgressAndRemainingTime.progress, "remainingTime": newProgressAndRemainingTime.remainingTime });
});

app.delete('/api/downloads/:fileName', (req, res) => {
	const fileName = req.params.fileName;
	activeFiles = activeFiles.filter((file) => file.fileName !== fileName);
	fs.unlinkSync(path.join(__dirname, "storage", "progressLogs", `${fileName}.log`));
	res.send("File deleted successfully");
});

app.listen(PORT, (error) => {
	if(!error)
		console.log("Server is successfully running, and app is listening on port " + PORT)
	else
		console.log("Error occurred, server can't start", error);
	}
);
