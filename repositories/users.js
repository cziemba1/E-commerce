const fs = require("fs");
const crypto = require("crypto");
const util = require("util");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a repository requires a filename");
    }
    this.filename = filename;
    try {
      //check if the file exist
      fs.accessSync(this.filename);
    } catch (err) {
      //create new file
      fs.writeFileSync(this.filename, "[]");
    }
  }

  async getAll() {
    //open the file called this.filename
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
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

  async comparePassword(saved, supplied) {
    //saved: password save in our database "hashed.salt"
    //supplied : password given by the user when trying to sign in

    const result = saved.split(".");
    const hashed = result[0];
    const salt = result[1];

    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString("hex");
  }

  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }
  //random id
  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }

  //get records by id
  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  //delete records
  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id != id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }
    //assign attrs to record
    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }
}

//only exports instance of UserRepository
module.exports = new UsersRepository("users.json");
