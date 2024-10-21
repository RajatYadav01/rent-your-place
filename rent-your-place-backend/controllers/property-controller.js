const pool = require("../services/database-connection");

const newProperty = async (request, response) => {
    const client = await pool.connect();
    try {
        const {country, place, totalArea, numberOfBedrooms, numberOfBathrooms, nearbyLandmark, monthlyRent, currencyUnit, ownerID} = request.body;
        const property = await client.query("SELECT * FROM properties WHERE property_country = $1 AND property_place = $2 AND property_total_area = $3 AND property_number_of_bedrooms = $4 AND property_number_of_bathrooms = $5 AND property_nearby_landmark = $6 AND property_rent_monthly = $7 AND property_rent_currency_unit = $8 AND property_owner_id = $9", [country, place, totalArea, numberOfBedrooms, numberOfBathrooms, nearbyLandmark, monthlyRent, currencyUnit, ownerID.toString()]);
        if (property.rows.length !== 0)
            return response.status(403).json({message: "Property already exists"});

        const newProperty = await client.query("INSERT INTO properties (property_country, property_place, property_total_area, property_number_of_bedrooms, property_number_of_bathrooms, property_nearby_landmark, property_rent_monthly, property_rent_currency_unit, property_owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING property_id", [country, place, totalArea, numberOfBedrooms, numberOfBathrooms, nearbyLandmark, monthlyRent, currencyUnit, ownerID.toString()]);
        return response.status(201).json({ 
            message: "Added",
            propertyID: newProperty.rows[0].property_id
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const getAllProperties = async (request, response) => {
    const client = await pool.connect();
    try {
        const properties = await pool.query(`SELECT property_id AS ${client.escapeIdentifier("id")}, property_country AS ${client.escapeIdentifier("country")}, property_place AS ${client.escapeIdentifier("place")}, property_total_area AS ${client.escapeIdentifier("totalArea")}, property_number_of_bedrooms AS ${client.escapeIdentifier("numberOfBedrooms")}, property_number_of_bathrooms AS ${client.escapeIdentifier("numberOfBathrooms")}, property_nearby_landmark AS ${client.escapeIdentifier("nearbyLandmark")}, property_rent_monthly AS ${client.escapeIdentifier("monthlyRent")}, property_rent_currency_unit AS ${client.escapeIdentifier("currencyUnit")}, property_owner_id AS ${client.escapeIdentifier("ownerID")}, property_like_count AS ${client.escapeIdentifier("likeCount")}, property_liked_by_user_ids AS ${client.escapeIdentifier("likedByUserIDs")} FROM properties ORDER BY property_created_at`);
        return response.status(200).json({
            properties: properties.rows
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const getOwner = async (request, response) => {
    const client = await pool.connect();
    try {
        const ownerID = request.header("ID");
        const userDetails = await client.query(`SELECT (user_first_name || ' ' || user_last_name) as ${client.escapeIdentifier("fullName")}, user_email_address as ${client.escapeIdentifier("emailAddress")}, user_phone_number as ${client.escapeIdentifier("phoneNumber")} FROM users WHERE user_id = $1`, [ownerID]);
        if (userDetails.rows.length === 0)
            return response.status(401).json({message: "Cannot get owner details"});

        return response.status(200).json({ 
            fullName: userDetails.rows[0].fullName,
            emailAddress: userDetails.rows[0].emailAddress,
            phoneNumber: userDetails.rows[0].phoneNumber
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const updateProperty = async (request, response) => {
    const client = await pool.connect();
    client.on('notice', (msg) => {
        console.log('NOTICE:', msg.message);
    });
    try {
        const {id, country, place, totalArea, numberOfBedrooms, numberOfBathrooms, nearbyLandmark, monthlyRent, currencyUnit, likeCount, likedByUserIDs} = request.body;
        const likedByUserIDsString = likedByUserIDs !== null ? likedByUserIDs.toString() : null;
        const property = await client.query(`UPDATE properties SET property_country = COALESCE($2, property_country), property_place = COALESCE($3, property_place), property_total_area = COALESCE($4, property_total_area), property_number_of_bedrooms = COALESCE($5, property_number_of_bedrooms), property_number_of_bathrooms = COALESCE($6, property_number_of_bathrooms), property_nearby_landmark = COALESCE($7, property_nearby_landmark), property_rent_monthly = COALESCE($8, property_rent_monthly), property_rent_currency_unit = COALESCE($9, property_rent_currency_unit), property_like_count = COALESCE($10, property_like_count), property_liked_by_user_ids = CASE WHEN $11::uuid IS NULL THEN property_liked_by_user_ids ELSE COALESCE(array_append(property_liked_by_user_ids, $11::uuid), ARRAY[$11::uuid]) END WHERE property_id = $1 RETURNING property_id`, [id, country, place, totalArea, numberOfBedrooms, numberOfBathrooms, nearbyLandmark, monthlyRent, currencyUnit, likeCount, likedByUserIDsString]);
        if (property.rows.length === 0)
            return response.status(401).json({message: "Property was not updated"});

        return response.status(200).json({ 
            message: "Updated",
            propertyID: property.rows[0].property_id
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const unlikeProperty = async (request, response) => {
    const client = await pool.connect();
    try {
        const {id, unlikedByUserID} = request.body;
        const property = await pool.query("UPDATE properties SET property_liked_by_user_ids = array_remove(property_liked_by_user_ids, $1), property_like_count = property_like_count - 1 WHERE property_id = $2 RETURNING property_id", [unlikedByUserID, id]);
        if (property.rows.length === 0)
            return response.status(401).json({message: "Property was not updated"});

        return response.status(200).json({ 
            message: "Updated",
            propertyID: property.rows[0].property_id
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

const deleteProperty = async (request, response) => {
    const client = await pool.connect();
    try {
        const id = request.header("ID");
        const property = await client.query("DELETE FROM properties WHERE property_id = $1 returning property_id", [id]);

        if (property.rows.length === 0)
            return response.status(401).json({message: "Cannot delete property"});
        
        return response.status(200).json({
            message: "Deleted",
            propertyID: property.rows[0].property_id
        });
    } catch (error) {
        console.error(error.message);
        return response.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
}

module.exports = {newProperty, getAllProperties, updateProperty, unlikeProperty, deleteProperty, getOwner};