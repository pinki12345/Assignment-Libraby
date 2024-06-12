
const bookTable = require("../models").Book;


exports.deleteBook = async(req,res) => {
    try {
        //const {id} = req.params;

        await bookTable.findOne({
            where:{
                id:req.params.id
            }
        }).then((data)=>{
            if(data){
                bookTable.destroy({
                    where:{
                        id:req.params.id
                    }
                }).then((data)=>{
                    res.json({
                        success:true,
                        message:'Book Deleted successfully',
                    });
                }).catch((error)=>{
                    res.json({
                        success:false,
                        message:'Failed to execute query',
                    });
                })
            }
            else{
                res.json({
                    success:false,
                    message:'No Book found',
                });
            }
        }).catch((error)=>{
            res
            .json({
                success:false,
                message:'Failed to execute query',
            });
        })

      
    }
    catch(err) {
        res.status(500)
        .json({
            success:false,
            message:'Server Error',
        });
    }
}
