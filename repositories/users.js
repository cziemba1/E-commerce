const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repositories");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async comparePassword(saved, supplied) {
    //saved: password save in our database "hashed.salt"
    //supplied : password given by the user when trying to sign in

    const result = saved.split(".");
    const hashed = result[0];
    const salt = result[1];

    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString("hex");
  }
  async create(attrs) {
    //attributes: email, password
    attrs.id = this.randomId();

    //salt
    const salt = crypto.randomBytes(8).toString("hex");
    const buf = await scrypt(attrs.password, salt, 64);

    //load content
    const records = await this.getAll();
    const record = {
      ...attrs,
      password: `${buf.toString("hex")}.${salt}`, //replacing basic password
    };
    //write the updated "records" array back to the file
    records.push(record);
    await this.writeAll(records);
    //return the user id later for cookies
    return record;
  }
}

//only exports instance of UserRepository
module.exports = new UsersRepository("users.json");
