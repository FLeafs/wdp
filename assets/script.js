front.on("errors", (err) => {
	bodys.innerHTML += "<br>"+err;
})
3
front.send("hi");

front.on("error", (msg) => {
	Swal.fire({
		title: "Error",
		text: msg,
		icon: "error"
	});
	front.send("init");
});
front.on("success", (msg) => {
	Swal.fire({
		title: "Success",
		text: msg,
		icon: "success"
	});
	front.send("init");
});

front.on("editAccount", (account) => {
	Swal.fire({
		title: 'Edit Account',
		html: `
		<input type="text" id="username" class="swal2-input" placeholder="Username" value="${account.username}">
		<input type="text" id="userId" class="swal2-input" placeholder="User ID" value="${account.userId}">
		<input type="text" id="zoneId" class="swal2-input" placeholder="Zone ID" value="${account.zoneId}">
		<input type="text" id="phone" class="swal2-input" placeholder="Phone Number" value="${account.phoneNumber}">
	  `,
		focusConfirm: false,
		showDenyButton: true,
		showCancelButton: true,
		confirmButtonText: 'Edit',
		denyButtonText: 'Delete',
		preConfirm: () => {
			const username = Swal.getPopup().querySelector('#username').value;
			const userId = Swal.getPopup().querySelector('#userId').value;
			const zoneId = Swal.getPopup().querySelector('#zoneId').value;
			const phone = Swal.getPopup().querySelector('#phone').value;

			if (!username || !userId || !zoneId) {
				Swal.showValidationMessage(`Please enter all fields`);
			}

			return { username, userId, zoneId, phone };
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const { username, userId, zoneId, phone } = result.value;
			front.send("editAccount", username, userId, zoneId, phone);
		} else if (result.isDenied) {
			front.send("deleteAccount", account.username);
		}
	});
});
front.on("editOrder", (order) => {
	Swal.fire({
		title: order.uuid,
		html: `Account : ${order.account.username}<br>UserID : ${order.account.userId}<br>ZoneID : ${order.account.zoneId}<br>Price : ${order.price}<br>Total Buy : ${order.buy}`,
		input: "textarea",
		inputValue: order.order.join("\n"),
		focusConfirm: false,
		showDenyButton: true,
		showCancelButton: true,
		confirmButtonText: 'Return',
		denyButtonText: 'Delete'
	}).then((result) => {
		if (result.isDenied) {
			front.send("deleteOrder", order.uuid);
		}
	});
});

function addAccount() {
	Swal.fire({
		title: 'Add Account',
		html: `
		<input type="text" id="username" class="swal2-input" placeholder="Username">
		<input type="text" id="userId" class="swal2-input" placeholder="User ID">
		<input type="text" id="zoneId" class="swal2-input" placeholder="Zone ID">
		<input type="text" id="phone" class="swal2-input" placeholder="Phone Number">
	  `,
		focusConfirm: false,
		preConfirm: () => {
			const username = Swal.getPopup().querySelector('#username').value;
			const userId = Swal.getPopup().querySelector('#userId').value;
			const zoneId = Swal.getPopup().querySelector('#zoneId').value;
			const phone = Swal.getPopup().querySelector('#phone').value;

			if (!username || !userId || !zoneId) {
				Swal.showValidationMessage(`Please enter all fields`);
			}

			return { username, userId, zoneId, phone };
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const { username, userId, zoneId, phone } = result.value;
			front.send("addAccount", username, userId, zoneId, phone);
		}
	});
}
function editAccount(username) {
	front.send("editAccount", username);
}
function addAccountIntoHTML(username, userId, zoneId, phone) {
	account.innerHTML += `
	<tr class="table-primary" onclick="editAccount('${username}')" style="cursor: pointer;">
		<td>${username}</td>
		<td>${userId}</td>
		<td>${zoneId}</td>
		<td>${phone}</td>
	</tr>
	`
}

function addOrder() {
	const accountList = document.getElementById('account');
	let options = '';

	for (let i = 0; i < accountList.rows.length; i++) {
		const username = accountList.rows[i].cells[0].innerText;
		options += `<option value="${username}">${username}</option>`;
	}

	Swal.fire({
		title: 'Add Order',
		html: `
		<input type="number" id="price" class="swal2-input" placeholder="Minimal Price">
		<input type="number" id="buy" class="swal2-input" placeholder="Total Buy">
		<label for="selectAccount">Select the Account (multiple)</label>
		<select id="selectAccount" class="swal2-select" multiple>
		  ${options}
		</select>
	  `,
		focusConfirm: false,
		preConfirm: () => {
			const price = Swal.getPopup().querySelector('#price').value;
			const buy = Swal.getPopup().querySelector('#buy').value;
			const selectedAccounts = Array.from(Swal.getPopup().querySelector('#selectAccount').selectedOptions).map(option => option.value);

			if (!price || !buy || selectedAccounts.length === 0) {
				Swal.showValidationMessage(`Please enter minimal price, total buy, and select at least one account`);
			}

			return { price, buy, selectedAccounts };
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const { price, buy, selectedAccounts } = result.value;
			front.send("addOrder", price, buy, selectedAccounts);
		}
	});
}
function editOrder(uuid) {
	front.send("editOrder", uuid);
}
function addOrderIntoHTML(price, buy, username, buyed, uuid) {
	order.innerHTML += `
	<tr class="table-${buyed ? "success" : "warning"}" onclick="editOrder('${uuid}')" style="cursor: pointer;">
		<td>${username}</td>
		<td>${price}</td>
		<td>${buy}</td>
		<td>${buyed}</td>
	</tr>
	`
}

front.on("init", (accounts, orders) => {
	account.innerHTML = "";
	order.innerHTML = "";
	accounts.forEach(acc => {
		addAccountIntoHTML(acc.username, acc.userId, acc.zoneId, acc.phoneNumber);
	});
	orders.forEach(o => {
		addOrderIntoHTML(o.price, o.buy, o.account.username, o.buyed, o.uuid);
	});
});

setInterval(()=> {front.send("init")}, 5000)