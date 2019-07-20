// import "aws-sdk/lib/node_loader"; // Hack needed before the first import
import aws from "aws-sdk";
// import s3 from "aws-sdk/clients/s3";
import { keys } from "../config/keys.mjs";
import multer from "multer";
import multerS3 from "multer-s3";

export const fileUpload = (req, next, cb) => {
  // console.log(config.config.Config);
  console.log(aws.config);
  aws.config.update({
    secretAccessKey: keys().s3SecretAccessKey,
    accessKeyId: keys().s3AccessKeyId,
    region: "us-east-1"
  });

  const s3 = new aws.S3();

  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(
        req.flash(
          "uploadMessage",
          "Please only upload files with a jpeg or png extension."
        ),
        false
      );
    }
  };

  const upload = multer({
    fileFilter,
    storage: multerS3({
      s3: s3,
      bucket: "blog-images54",
      acl: "public-read",
      metadata: function(req, file, cb) {
        cb(null, { fieldName: "TESTING_META_DATA!" });
      },
      key: function(req, file, cb) {
        console.log(file);
        cb(null, `${Date.now().toString()}-${file.originalname}`);
      }
    })
  });

  return upload;
};

export default fileUpload;
