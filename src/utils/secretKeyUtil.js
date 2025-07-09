const bcrypt = require("bcrypt");
const { AppError } = require("./errors");
async function verifyKey(secretKey, hashedSecretKey) {
  try {
    return await bcrypt.compare(secretKey, hashedSecretKey);
  } catch (err) {
    throw new AppError("Key verification failed", 500, true, {
      service: "authService.verifyKey",
      raw: err,
    });
  }
}

module.exports = {
  verifyKey
};
