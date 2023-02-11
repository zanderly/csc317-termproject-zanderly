const db = require('../conf/database.js');
const bcrypt = require('bcrypt');
const UserError = require('../helpers/error/UserError');

const UserModel = {
    create: function(username, password, email) {
        return bcrypt.hash(password, 10)
        .then((hashedPassword) => {
            return db.execute('INSERT INTO users (username, email, password, created) VALUES (?,?,?, now());',
		    [username, email, hashedPassword]);
        })
        .then(([results, fields]) => {
            return Promise.resolve(results && results.affectedRows);
        })
        .catch((err) => {
            throw err;
        });
    },

    authenticate: function(username, password) {
        let userID;
        return db.execute('SELECT id,password FROM users WHERE username=?', [username])
        .then(([results, fields]) => {
            if(results && results.length == 1) {
                userID = results[0].id;
                return bcrypt.compare(password, results[0].password);
            } else {
                throw new UserError("User not found", "/login", 200);
            }
        })
        .then((hashesMatch) => {
            if(hashesMatch) {
                return Promise.resolve({user: username, uid: userID});
            } else {
                return Promise.resolve(false);
            }
        })
        .catch((err) => {
            throw err;
        });
    },

    usernameExists: function(username) {
        return db.execute('SELECT * FROM users WHERE username=?',[username])
	    .then(([results, fields]) => {
            return Promise.resolve(results && (results.length == 0));
		    }
        )
        .catch((err) => {throw err;});
    },

    emailExists: function(email) {
        return db.execute('SELECT * FROM users WHERE email=?',[email])
	    .then(([results, fields]) => {
            return Promise.resolve(results && (results.length == 0));
		    }
        )
        .catch((err) => {throw err;});
    }
}

module.exports = UserModel;