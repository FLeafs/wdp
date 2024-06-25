const back = require('androidjs').back;
const http = require('http');
const fs = require('fs');

http.createServer((req,res) => {
    if (fs.existsSync("."+req.url)) {
        return res.end(fs.readFileSync("."+req.url).toString());
    } else {
        return res.end(fs.readFileSync("./index.html").toString());
    }
}).listen(8080);

process.on("uncaughtException", (err, origin) => {
	back.send("errors", JSON.stringify({ err: err, origin: origin }));
});
process.on("unhandledRejection", (err) => {
	back.send("errors", JSON.stringify({ err: err }));
});
back.on("hi", async () => {
	back.send("errors", "Hi From Back");
	const XCashShop = require("./assets/xcashshop.js");
	back.send("errors", "Hi From Back");
	var xcashshop = new XCashShop();
	back.send("errors", "Hi From Back");

	back.on("addAccount", (username, userId, zoneId, phone) => {
		const addAccount = xcashshop.createAccount(username, userId, zoneId, phone);
		if (!addAccount) return back.send("error", "You already have this account");
		return back.send("success", JSON.stringify(addAccount, null, 4));
	});
	back.on("editAccount", (username, userId, zoneId, phone) => {
		if (!userId && !zoneId && !phone) {
			return back.send("editAccount", xcashshop.db.account[username]);
		} else {
			xcashshop.db.account[username] = { username, userId, zoneId, phoneNumber: phone }
			xcashshop.saveDatabase();
			return back.send("success", JSON.stringify(xcashshop.db.account[username], null, 4));
		}
	});
	back.on("deleteAccount", (username) => {
		delete xcashshop.db.account[username];
		xcashshop.saveDatabase();
		return back.send("success", "Account Deleted");
	});

	back.on("addOrder", (price, buy, account) => {
		account.forEach(acc => {
			xcashshop.createOrder(price, buy, acc);
		});
		xcashshop.saveDatabase();
		return back.send("success", "Order Placed");
	});
	back.on("editOrder", (uuid) => {
		return back.send("editOrder", xcashshop.db.order[uuid]);
	}); back.on("deleteOrder", (uuid) => {
		delete xcashshop.db.order[uuid];
		xcashshop.saveDatabase();
		return back.send("success", "Order Deleted");
	});

	back.on("logs", (log) => {
		if (enableLogs.checked) {
			logs.innerHTML += "\n" + log;
			document.getElementById("logs").scrollTop = document.getElementById("logs").scrollHeight;
		}
	});
	back.on("init", () => {
		back.send("init", Object.values(xcashshop.db.account), Object.values(xcashshop.db.order));
		xcashshop.saveDatabase();
	});
	back.send("errors", "Hi From Back");
});

