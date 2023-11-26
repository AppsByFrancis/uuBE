import express from "express";
import asyncHandler from 'express-async-handler';
import { body, validationResult } from "express-validator";
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request object
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};
app.get('/list/:listId', authenticate, asyncHandler(async (req, res) => {
    const { listId } = req.params;
    const userId = req.user.id; // Assuming the user's ID is encoded in the JWT

    try {
        if (/* Check if the userId matches the list owner or if the user is invited */) {
            // Fetch the list from the database
        } else {
            return res.status(403).send('Access denied.');
        }
    } catch (error) {
        console.error("List couldn't be displayed. Error message: ". err)
    }
   
}));

app.get("/list", async (req, res) => {
	try {
		// Logic to retrieve all lists
		const lists = [
			{ id: 1, name: "Groceries", items: ["Milk", "Bread"] },
			{ id: 2, name: "Hardware", items: ["Nails", "Hammer"] },
		];

		res.status(200).json(lists);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error retrieving lists");
	}
});

app.post("/create-user", [
	body("username").isLength({ min: 5 }).withMessage("Username must be at least 5 characters long"),
	body("email").isEmail().withMessage("Email must be valid"),
	body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
	(req, res) => {
		const errors = validationResult(req);
		try {
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { username, email, password } = req.body;

			res.status(201).send("User created successfully");
		} catch (err) {
			console.error("User couldn't be created. Error message: ", err);
		}
	},
]);

app.post("/create-list", [
	body("name").isLength({ min: 3 }).withMessage("List name must be at least 3 characters long"),
	body("userId").isLength({ min: 5 }).withMessage("User ID must be valid"),
	body("items").optional().isArray().withMessage("Items must be an array"),
	(req, res) => {
		const errors = validationResult(req);
		try {
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { name, userId, items } = req.body;
			// Logic to create the list
			res.status(201).send("List created successfully");
		} catch (err) {
			console.error("List couldn't be created. Error message: ", err);
		}
	},
]);

app.post("/list/:listId/invite", [
	body("inviteeUserId").isLength({ min: 5 }).withMessage("Invitee User ID must be valid"),
	(req, res) => {
		const { listId, userId, ownerId } = req.params;
		const { inviteeUserId } = req.body;
		try {
			if (userId == ownerId) {
				// If yes, add the inviteeUserId to the list's invitedUsers array
				res.status(200).send(`User ${inviteeUserId} invited to list ${listId}`);
			} else {
				res.status(200).send(`You are not the owner of this list`);
			}
		} catch (err) {
			console.error("User couldn't be added to the list. Error message: ", err);
		}
	},
]);

app.post("/list/:listId/add-item", [
	body("itemName").isLength({ min: 1 }).withMessage("Item name must be provided"),

	(req, res) => {
		const { listId } = req.params;
		const { itemName } = req.body;
		try {
			// Logic to add the item to the list
			res.status(200).send(`Item ${itemName} added to list ${listId}`);
		} catch (err) {
			console.error("Item couldn't be added to the list. Error message: ", err);
		}
	},
]);

app.delete("/list/:listId", (req, res) => {
	const { listId, userId, ownerId } = req.params;
	try {
		if (ownerId == userId) {
			// delete list
			res.status(200).send(`List ${listId} deleted`);
		} else {
			res.status(200).send(`You don't have enough permissions`);
		}
	} catch (err) {
		console.error("List couldn't be deleted. Error message: ", err);
	}

	res.status(200).send(`List ${listId} deleted`);
});

app.delete("/list/:listId/item/:itemId", (req, res) => {
	const { listId, itemId, userId, ownerId } = req.params;
	try {
		if (ownerId == userId) {
			// delete uten
			res.status(200).send(`Item ${itemId} removed from list ${listId}`);
		} else {
			res.status(200).send(`You don't have enough permissions`);
		}
	} catch (err) {
		console.error("item couldn't be deleted. Error message: ", err);
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
