const bookTable = require("../models").Book;

exports.getApprovedBooks = async (req, res) => {
    try {
        const books = await bookTable.findAll({
            where: {status: true }
        });

        res.status(200).json({
            success: true,
            data: books,
            message: "Approved books retrieved successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: "internal server error",
        });
    }
};


