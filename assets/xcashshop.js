const fetch = require("node-fetch");
const fs = require("fs");
const uuidv4 = require("uuidv4");

function generatePhone() {
    let phoneNumber = "0888"; // Kode awal nomor telepon

    // Menghasilkan 8 digit sisanya
    for (let i = 0; i < 8; i++) {
        phoneNumber += Math.floor(Math.random() * 10); // Digit acak dari 0 hingga 9
    }

    return phoneNumber;
}

class Headers {
    constructor(json) {
        this["Accept-Encoding"] = "gzip",
            this["Connection"] = "Keep-Alive",
            this["user-agent"] = "app/14.0.14 Mozilla/5.0 (Linux; Android 14; 23021RAA2Y Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.54 Mobile Safari/537.36"
        if (json) {
            this["Content-Type"] = "application/json"
        }
    }
}

class Account {
    constructor(username, id, zone, phone) {
        this.username = username;
        this.userId = id;
        this.zoneId = zone;
        this.phoneNumber = phone ? phone : generatePhone();
    }
}

class Order {
    constructor(account, product, item, payment) {
        this.username = account.username;
        this.data = {
            userId: account.userId,
            zoneId: account.zoneId
        },
            this.phoneNumber = account.phoneNumber;
        this.productId = product;
        this.productItemId = item;
        this.paymentChannelId = payment;
    }
}

class XCashShop {
    constructor() {
        this.db = JSON.parse(fs.readFileSync("./db.json").toString());
        setInterval(async () => {
            const WDPList = await this.getWDPList();
            const OrderList = Object.values(this.db.order).filter(x => x.buyed === false);
            const QRIS = await this.getQRIS();

            OrderList.sort((a, b) => b.price - a.price);
            WDPList.sort((a, b) => a.price - b.price);

            WDPList.forEach(wdp => {
                for (let order of OrderList) {
                    if (wdp.price > order.price) break;
                    for (let i = 0; i < order.buy; i++) {
                        this.orderAndSave(order.account, wdp.productId, wdp.id, QRIS.id, order.uuid);
                    }
                }
            });
        }, 5000);
    }

    saveDatabase() {
        fs.writeFileSync("./db.json", JSON.stringify(this.db));
    }

    async getMLBB() {
        const mlbb = await fetch("https://xc-api.xcashshop.com/product/mobile-legends", {
            headers: new Headers()
        }).then(x => x.json());
        return mlbb;
    }

    async getWDP() {
        const wdp = await fetch("https://xc-api.xcashshop.com/product/weekly-diamond-pass", {
            headers: new Headers()
        }).then(x => x.json());
        return wdp;
    }

    async getPayment() {
        const payment = await fetch("https://xc-api.xcashshop.com/payment?except=wallet", {
            headers: new Headers()
        }).then(x => x.json());
        return payment;
    }

    async getWDPList() {
        const MLBB = await this.getMLBB();
        const WDP = await this.getWDP();
        MLBB.data.items.map(x => x.productId = MLBB.data.id);
        WDP.data.items.map(x => x.productId = WDP.data.id);
        return [...MLBB.data.items, ...WDP.data.items].filter(x => x.name.toLowerCase().includes("weekly"));
    }

    async getQRIS() {
        const PAYMENT = await this.getPayment();
        return PAYMENT.filter(x => x.group === "QRIS")[0].datas[0];
    }

    async order(account, product, item, payment) {
        const ORDER = await fetch("https://xc-api.xcashshop.com/order", {
            method: "POST",
            headers: new Headers(true),
            body: JSON.stringify(new Order(account, product, item, payment))
        }).then(x => x.json());
        return ORDER;
    }

    orderAndSave(account, product, item, payment, uuid) {
        const ORDER = fetch("https://xc-api.xcashshop.com/order", {
            method: "POST",
            headers: new Headers(true),
            body: JSON.stringify(new Order(account, product, item, payment))
        }).then(x => x.json()).then(x => {
            if (x.statusCode === 200) {
                this.db.order[uuid].buyed = true;
                this.db.order[uuid].order.push(`https://xcashshop.com/history/${account.phoneNumber}/${x.data}`);
            }
        });
    }

    createAccount(username, id, zone, phone) {
        if (Object.keys(this.db.account).indexOf(username) > -1) return false;
        const ACCOUNT = new Account(username, id, zone, phone);
        this.db.account[username] = ACCOUNT;
        this.saveDatabase();
        return ACCOUNT;
    }

    createOrder(price, buy, account) {
        const uuid = uuidv4.uuid();
        this.db.order[uuid] = {
            account: this.db.account[account],
            price: Number(price), buy: Number(buy), uuid, buyed: false, order: []
        };
        return true;
    }
}

module.exports = XCashShop;