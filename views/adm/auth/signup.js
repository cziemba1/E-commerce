const layout = require("../layout");

const getError = (errors, prop) => {
  //prop ==="email" || "password" || "passwordConfirmation"

  if (errors) {
    //errors.mapped() return an object => with the msg i want
    try {
      return errors.mapped()[prop].msg;
    } catch (err) {
      return "";
    }
  }
};

module.exports = ({ req, errors }) => {
  return layout({
    content: `
    <div>
        Your session ID is ${req.session.userId}
        <form method="POST">
            <input name="email" placeholder="email" />
            ${getError(errors, "email")}
            <input name="password" placeholder="password" />
            ${getError(errors, "password")}
            <input name="passwordConfirmation" placeholder="password confirmation" />
            ${getError(errors, "passwordConfirmation")}
            <button>Sign Up</button>
        </form>
    </div>
  `,
  });
};
