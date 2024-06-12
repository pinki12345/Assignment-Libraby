const bookTable = require("../models").Book;

exports.createBook = async (req, res) => {
    try {
        const { title, content, email } = req.body;

        const response = await bookTable.create({ title, content, adminEmail });
        await mailSender(
            email,
            `New Book Created: ${book.title}`,
            `A new book has been created or updated:\n\nTitle: ${book.title}\nContent: ${book.content}`
          );
        res.status(200).json({
            success: true,
            data: response,
            message: 'Entry Created Successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: "internal server error",
        });
    }
};

exports.approveOrRejectBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, status } = req.body;
        const book = await bookTable.findByPk(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }
        if (status) {
            book.status = true;
            await book.save();

            res.status(200).json({
                success: true,
                message: "Book approved and visible to users",
                data: book
            });
        } else {
            await mailSender(
                email,
                `Book Rejected: ${book.title}`,
                `Your book submission has been rejected:\n\nTitle: ${book.title}\nContent: ${book.content}`
              );
            await book.destroy(); 

            res.status(200).json({
                success: true,
                message: "Book rejected and admin notified"
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            data: "internal server error",
        });
    }
};