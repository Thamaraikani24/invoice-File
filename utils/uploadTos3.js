const {
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../config/s3Config");

const uploadToS3 = async (file, invoiceNumber) => {

  
  const fileName = `invoice-files/${invoiceNumber}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(params));

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  });

  const fileUrl = await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });

  return {
    fileName: file.originalname,
    fileUrl,
  };
};

module.exports = uploadToS3;