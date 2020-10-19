const auth = require("../auth/auth");

module.exports = function secure() {
	return function (req, res, next) {
		auth.logeado(req)
        .then(() => {
            //si las credenciales son correctas pasa al siguien middleware
            next();
        })
        .catch(() => {
            //si no son correctas envia un 401
            res.status(401).send({
                message: "No autorizado",
            });
        });
	};
};
