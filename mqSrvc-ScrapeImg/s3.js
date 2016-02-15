'use strict';

const _ = require('highland');
const Promise = require('bluebird');
const request = require('request');
const url = require('url');
const fs = require('fs');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const credentials = require('../common/secrets/aws.json');
const s3_fixtures = require('../common/fixtures/s3.json');
const s3 = new AWS.S3(credentials);
// Promise.promisifyAll(Object.getPrototypeOf(s3));
const s3Stream = require('s3-upload-stream')(s3);

function pipeTransformAndUploadImgObjToS3 (imgObj, bucket) {
  bucket = bucket || s3_fixtures.defBucketRef;
  console.log(`pipeTransform called on ${imgObj} to go to ${bucket}`);
  return new Promise((resolve, reject) => {
    let file = imgObj.orig_url.split('/').reverse()[0];
    let name = file.split('.');
    let ext = name.pop();
    ext = ext === 'jpg' ? 'jpeg' : ext;

    let options = [
      { width: 'full', quality: 100 },
      { width: 300, quality: 40 },
      { width: 600, quality: 80 },
    ];
    
    // let writableStream = fs.createWriteStream(`${bucket}/${file}`);
    let writableStreams = options.map((item, i) => {
        return s3Stream.upload({
          Bucket: bucket,
          Key: `${name}-w${options[i].width}-q${options[i].quality}.${ext}`,
          ACL: 'public-read',
          StorageClass: 'REDUCED_REDUNDANCY',
          ContentType: imgObj.type
        })
        .on('error', err => {
          console.log(err, err.stack);
          reject(err);
        })
        .on('uploaded', details => {
          imgObj.s3_url = details.Location;
          imgObj.s3_bucket = details.Bucket;
          imgObj.s3_key = details.Key;
          imgObj.s3_etag = details.ETag;
          console.log(`uploaded ${file} to ${imgObj.s3_bucket} on s3`);
          resolve(imgObj);
        });
      });

    let pipeline = sharp().withMetadata().on('error', err => { console.log(err); });
    pipeline.pipe(writableStreams[0])
    pipeline.clone().resize(options[1].width).quality(options[1].quality).withMetadata().pipe(writableStreams[1]);
    pipeline.clone().resize(options[2].width).quality(options[2].quality).withMetadata().pipe(writableStreams[2]);

    var req = request.get(imgObj.orig_url) // readableStream
    .on('response', response => {
      console.log(response.statusCode);
      console.log(response.headers['content-type']);
      if (response.headers['content-type'].split('/')[0] === 'image' ) {
        console.log('URL resolved to image');
        req.pipe(pipeline)
      } else {
        resolve({}); // TODO come up with solution for when image url does not resolve to an image successfully
      }
    })
    .on('error', err => {
      console.log(err, err.stack);
      reject(err);
    });
    // .pipe(pipeline);
  });
}

// function pipeImgSetToBucket (imgSet, bucket) {
//   let pipePromises = [];
//   imgSet.forEach(imgObj => {
//     pipeTransformAndUploadImgObjToS3(imgObj, bucket)
//     .then(obj => {
//       // console.log('resolved pipePromise', obj);
//       // console.log('resolved pipePromise', obj.details);
//     });
//   });
//   return Promise.all(pipePromises);
// }

// pipeImgSetToBucket(s3_fixtures.myImgObjs, s3_fixtures.myBucketRef)
// .then(res => {
//   console.log('all promises resolved, images uploaded');
// });
// .then(res => {
//   console.log('piped', res);
  // s3Stream.listObjects({ Bucket: myBucketRef }, (err, res) => {
  //   if (err) console.log(err, err.stack);
  //   else console.log(res);
  // });
// });

// _(myFileSet).map(file => {
//   let options = {
//     width: [400, 800],
//     quality: [50, 80]
//   };

//   let readableStream = fs.createReadStream(`${mySourceDirRef}/${file}`);
//   let pipeline = multiplexToLocalFiles(file, options, myTargetDirRef);
//   return readableStream.pipe(pipeline);
// })
// .each(imgStream => {
//   console.log('imgStream', typeof imgStream);
//   imgStream.metadata()
//   .then(metadata => {
//     console.log('metadata', metadata);
//   })
// })

function multiplexToLocalFiles (file, options, targetDir) {
  let name = file.split('.');
  let ext = name.pop();

  let readPath = file;
  let writePath0 = `${targetDir}/${name}-orig.${ext}`;
  let writePath1 = `${targetDir}/${name}-w${options.width[0]}-q${options.quality[0]}.${ext}`;
  let writePath2 = `${targetDir}/${name}-w${options.width[1]}-q${options.quality[1]}.${ext}`;

  let writableStream0 = fs.createWriteStream(writePath0);
  let writableStream1 = fs.createWriteStream(writePath1);
  let writableStream2 = fs.createWriteStream(writePath2);

  let pipeline = sharp();
  pipeline.clone().pipe(writableStream0);
  pipeline.clone().resize(options.width[0]).quality(options.quality[0]).pipe(writableStream1);
  pipeline.clone().resize(options.width[1]).quality(options.quality[1]).pipe(writableStream2);
  return pipeline;
}

// AWS helpers

// function createBucket () {
//   s3.createBucketAsync({Bucket: 'vid_decomp'})
//   .then((res) => {
//     console.log('res', res)
//     var params = {Bucket: 'vid_decomp', Key: 'test', Body: 'testStr'};

//     return s3.putObjectAsync(params);
//   })
//   .then(data => {
//     console.log('data', data);
//   })
//   .catch(throwErr);
// }

// function throwErr (err) {
//   console.log(err);
//   throw err;
// }  

module.exports = {
  pipeTransformAndUploadImgObjToS3: pipeTransformAndUploadImgObjToS3
};
