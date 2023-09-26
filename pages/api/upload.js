import multiparty from 'multiparty';
import {S3Client} from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types'
import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';

const bucketName='next-ecomm-sneha'

export default async function handle(req, res){
  await mongooseConnect();
  await isAdminRequest(req, res);
  
  const form = new multiparty.Form();

  const {fields, files} = await new Promise((resolve, reject)=>{
    form.parse(req, (err, fields, files)=>{
        if(err) reject(err);
        resolve({fields, files})
        
      } )

  })
  console.log('length: ', files);
  const client = new S3Client({
    region: 'us-east-1',
    credentials:{
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const links = [];
  for(const file of files.file){
    //to extract the extension of file from its name and allocate random filename
    const ext = file.originalFilename.split('.').pop();
    const newFileName = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFileName,
      //body will read main path using fs
      Body: fs.readFileSync(file.path),
      ACL: 'public-read',
      ContentType: mime.lookup(file.path),

    }
    ));
    const link = `https://${bucketName}.s3.amazonaws.com/${newFileName}`;
    links.push(link)
  }
  
  return res.json({links});
  
}


//dont want next to parse the request rather want to do on ourselves
export const config = {
    api: {bodyParser: false},
     
};