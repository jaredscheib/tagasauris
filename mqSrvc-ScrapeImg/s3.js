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
  bucket = bucket || `${s3_fixtures.defBucketRef}/${imgObj.concept}`;
  console.log(`pipeTransform called on ${imgObj} to go to ${bucket}`);
  return new Promise((resolve, reject) => {
    let req, writableStreams, pipeline;
    let fileArr = imgObj.orig_url.split('/').pop().split('.');
    // let name = fileArr[0];
    let ext = fileArr[1];
    ext = ext === 'jpeg' ? 'jpg' : ext;
    if ('jpg|png|gif'.indexOf(ext) === -1) {
      console.log('Image has no decoding extension. Fulfilling null.', ext)
      return resolve(null); // hotfix for files with no extensions
    }

    let options = [
      { bucket: `${bucket}/wfullq100`, width: 'full', quality: 100 },
      { bucket: `${bucket}/w300q40`, width: 300, quality: 40 },
      { bucket: `${bucket}/w600q80`, width: 600, quality: 80 }
    ];
    
    let uploadCount = 0;
    let uuid = generateUUID();
    // create a writable stream for each option set
    writableStreams = options.map((item, i) => {
        let s3WritableStream = s3Stream.upload({
          Bucket: options[i].bucket,
          Key: `${uuid}-C${imgObj.concept}-Q${imgObj.query}-W${options[i].width}-L${options[i].quality}.${ext}`,
          ACL: 'public-read',
          StorageClass: 'REDUCED_REDUNDANCY',
          ContentType: imgObj.type
        })
        .on('error', err => {
          console.log(err, err.stack);
          resolve(null); // no reject
        })
        .on('uploaded', details => {
          uploadCount++;
          console.log(`uploaded to s3: ${details.Key}`);
          if (details.Key.indexOf('w600q80') !== -1) {
            imgObj.url = details.Location;
            imgObj.s3_bucket = details.Bucket;
            imgObj.s3_key = details.Key;
            imgObj.s3_etag = details.ETag;
          }
          if (uploadCount === options.length) {
            req.removeAllListeners();
            writableStreams.forEach(s => { s.removeAllListeners(); });
            pipeline.removeAllListeners();
            resolve(imgObj);
          }
        });

        return s3WritableStream;
      });

    // image processing multiplexer pipeline
    pipeline = sharp().withMetadata().on('error', err => { console.log(err); });
    pipeline.pipe(writableStreams[0])
    pipeline.clone().resize(options[1].width).quality(options[1].quality).withMetadata().pipe(writableStreams[1]);
    pipeline.clone().resize(options[2].width).quality(options[2].quality).withMetadata().pipe(writableStreams[2]);

    // begin readable stream pipe from image url
    req = request.get(imgObj.orig_url, { timeout: 2000, followRedirect: res => {
        console.log('redirect!');
        req.removeAllListeners();
        resolve(null); // skip any images that try to redirect
        return false;
      }
    })
    // .setMaxListeners(10)
    .on('response', response => {
      console.log(response.statusCode);
      console.log('content-type', response.headers['content-type']);
      if (response.headers['content-type'].split('/')[0] === 'image' ) {
        console.log('URL resolved to image');
        req.pipe(pipeline)
      } else {
        req.removeAllListeners();
        resolve(null); // TODO come up with solution for when image url does not resolve to an image successfully
      }
    })
    .on('error', err => {
      console.log(err, err.stack);
      req.removeAllListeners();
      resolve(null); // no reject
    });
  });
}

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

function generateUUID(){
  var d = new Date().getTime();
  d += process.hrtime()[0];

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

module.exports = {
  pipeTransformAndUploadImgObjToS3: pipeTransformAndUploadImgObjToS3
};
