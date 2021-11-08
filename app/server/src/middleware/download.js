const util = require("util");
const GridFsStorage = require("multer-gridfs-storage");
const {mongoCli} = require("../../public/db")
const mongoose = require("mongoose")

mongoCli.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(mongoCli.db, { bucketName: "files" });
});

download = function(req, res, next){
    gfs.find({filename: req.params.filename})
        .toArray((err, files) => {
            if(!files[0] || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No Files Available',
                });
            }
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
    
};

var uploadFilesMiddleware = util.promisify(download);
module.exports = uploadFilesMiddleware;
