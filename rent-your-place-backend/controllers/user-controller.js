const pool = require("../services/database-connection");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utilities/jwt-generator");

const newUser = async (request, response) => {
    const client = await pool.connect();
    try {
        const {userType, firstName, lastName, emailAddress, phoneNumber, password} = request.body;

        const user = await client.query("SELECT * FROM users WHERE user_email_address = $1", [emailAddress]);

        if (user.rows.length !== 0)
            return response.status(409).json({message: "User already exists with the entered email address"});

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const bcryptPassword = await bcrypt.hash(password, salt);

        await client.query("INSERT INTO users (user_first_name, user_last_name, user_email_address, user_phone_number, user_password, user_type) VALUES ($1, $2, $3, $4, $5, $6)", [firstName, lastName, emailAddress, phoneNumber, bcryptPassword, userType]);

        return response.status(201).json({
            status: "Registration successful"
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const authenticate = async (request, response) => {
    const client = await pool.connect();
    try {
        const {emailAddress, password} = request.body;

        const user = await client.query("SELECT * FROM users WHERE user_email_address = $1", [emailAddress]);

        if (user.rows.length === 0)
            return response.status(404).json({message: "User does not exist. Please check if the entered email address is correct."});

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].user_password);

        if(!isPasswordValid)
            return response.status(401).json({message: "Email address or password is incorrect."});

        const jwtToken = jwtGenerator(user.rows[0].user_id);
        return response.status(200).json({ 
            jwtToken: jwtToken,
            userType: user.rows[0].user_type
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const verify = async (request, response) => {
    const client = await pool.connect();
    try {
        const userType = request.header("UserType");

        const user = await pool.query("SELECT user_first_name FROM users WHERE user_id = $1", [request.user]);
        return response.status(200).json({
            message: "Verified",
            userType: userType,
            firstName: user.rows[0].user_first_name
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const getID = async (request, response) => {
    const client = await pool.connect();
    try {
        const user = await pool.query(`SELECT user_id FROM users WHERE user_id = $1`, [request.user]);
        return response.status(200).json({
            userID: user.rows[0].user_id 
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const getUser = async (request, response) => {
    const client = await pool.connect();
    try {
        const user = await pool.query(`SELECT user_id AS ${client.escapeIdentifier("id")}, user_first_name AS ${client.escapeIdentifier("firstName")}, user_last_name AS ${client.escapeIdentifier("lastName")}, user_email_address AS ${client.escapeIdentifier("emailAddress")}, user_phone_number AS ${client.escapeIdentifier("phoneNumber")}, user_type AS ${client.escapeIdentifier("userType")} FROM users WHERE user_id = $1`, [request.user]);
        return response.status(200).json(user.rows[0]);
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const resetPassword = async (request, response) => {
    const client = await pool.connect();
    try {
        const {emailAddress, password} = request.body;

        const user = await client.query("SELECT * FROM users WHERE user_email_address = $1", [emailAddress]);

        if (user.rows.length === 0) {
            return response.status(404).json({message: "User does not exist. Please check if the entered email address is correct for the selected user type."});
        }

        let bcryptPassword;
        if (password !== "") {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            bcryptPassword = await bcrypt.hash(password, salt);
        }

        if (bcryptPassword) {
            await client.query("UPDATE users SET user_password = COALESCE($1, user_password) WHERE user_id = $2", [bcryptPassword, user.rows[0].user_id]);
        }

        return response.status(201).json({
            status: "Password reset successful"
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const updateUser = async (request, response) => {
    const client = await pool.connect();
    try {
        const {id, userType, firstName, lastName, phoneNumber, password} = request.body;

        const user = await client.query("SELECT user_type FROM users WHERE user_id = $1", [id]);
        
        let isUserTypeUpdated = false;
        if (userType !== user.rows[0].user_type) {
            isUserTypeUpdated = true;
            await pool.query("DELETE FROM properties WHERE property_owner_id = $1 returning property_id", [id]);
        }

        let bcryptPassword;
        if (password !== "") {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            bcryptPassword = await bcrypt.hash(password, salt);
        }

        await client.query("UPDATE users SET user_first_name = COALESCE($2, user_first_name), user_last_name = COALESCE($3, user_last_name), user_phone_number = COALESCE($4, user_phone_number), user_password = COALESCE($5, user_password), user_type = COALESCE($6, user_type) WHERE user_id = $1", [id, firstName, lastName, phoneNumber, bcryptPassword, userType]);

        return response.status(201).json({
            status: "Update successful",
            userTypeUpdated: isUserTypeUpdated,
            newUserType: userType.toLowerCase()
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const deleteUser = async (request, response) => {
    const client = await pool.connect();
    try {
        const id = request.header("ID");
        const userType = request.header("UserType");
        const userID = await client.query("DELETE FROM users WHERE user_id = $1 returning user_id", [id]);

        if (userID.rows.length === 0)
            return response.status(401).json({message: "Cannot delete user"});
        else if (userID.rows.length !== 0) {
            if (userType.toLowerCase() === "owner") {
                await pool.query("DELETE FROM properties WHERE property_owner_id = $1 returning property_id", [id]);
            }
            await pool.query("UPDATE properties SET property_liked_by_user_ids = array_remove(property_liked_by_user_ids, $1), property_like_count = property_like_count - 1 WHERE $1 = ANY(property_liked_by_user_ids) RETURNING property_liked_by_user_ids, property_like_count", [id]);
        }

        return response.status(200).json({
            status: "User deleted"
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

module.exports = {newUser, authenticate, verify, getID, getUser, updateUser, resetPassword, deleteUser};