'use strict';

const _ = require('highland');
const Promise = require('bluebird');
const request = require('request');
const url = require('url');
const fs = require('fs');
const sharp = require('sharp');
// const AWS = require('aws-sdk');
// const credentials = require('../common/secrets/aws.js').S3_credentials;
// const s3 = new AWS.S3(credentials);
// Promise.promisifyAll(Object.getPrototypeOf(s3));
// const s3Stream = require('s3-upload-stream')(new AWS.S3(credentials));

let myBucketRef = './test_bucket'

let myImgSet = [
  'http://gtspirit.com/wp-content/uploads/2015/09/Mansory-Porsche-Macan-2.jpg',
  'http://pngimg.com/upload/audi_PNG1736.png',
  'https://i.ytimg.com/vi/0E05jQYpdpE/maxresdefault.jpg'
];

let myFileSet = [
  'Mansory-Porsche-Macan-2.jpg',
  'audi_PNG1736.png',
  'maxresdefault.jpg'
];

function pipeImgToBucket (imgURL, bucket) {
  let file = imgURL.split('/').reverse()[0];
  let writableStream = fs.createWriteStream(`${bucket}/${file}`);
  request.get(imgURL)
  .on('response', response => {
    console.log(response.statusCode);
    console.log(response.headers['content-type']);
  })
  .on('error', err => {
    console.log('error:', err);
  })
  .pipe(writableStream);

  writableStream.on('close', () => {
    console.log('finished write stream', file);
    // createResizedImg(file);
  });
}

function pipeImgSetToBucket (imgSet, bucket) {
  imgSet.forEach(imgURL => {
    pipeImgToBucket(imgURL, bucket);
  });
}

// pipeImgSetToBucket(myImgSet, myBucketRef);
_(myFileSet).map(file => {
  let options = {
    width: [400, 800],
    quality: [50, 80]
  };

  return pipeTransform(file, myBucketRef, options);
})
.each(res => {
  console.log('res', typeof res);
  res.metadata()
  .then(metadata => {
    console.log('metadata', metadata);
  })
})

function pipeTransform (file, targetDir, options) {
  let name = file.split('.');
  let ext = name.pop();

  let readPath = `${targetDir}/${name}.${ext}`;
  let writePath1 = `${targetDir}/${name}-w${options.width[0]}-q${options.quality[0]}.${ext}`;
  let writePath2 = `${targetDir}/${name}-w${options.width[1]}-q${options.quality[1]}.${ext}`;

  let readableStream = fs.createReadStream(readPath);
  let writableStream1 = fs.createWriteStream(writePath1);
  let writableStream2 = fs.createWriteStream(writePath2);

  let pipeline = sharp();
  pipeline.clone().resize(options.width[0]).quality(options.quality[0]).pipe(writableStream1);
  pipeline.clone().resize(options.width[1]).quality(options.quality[1]).pipe(writableStream2);
  return readableStream.pipe(pipeline);
}

// AWS helpers

function createBucket () {
  s3.createBucketAsync({Bucket: 'vid_decomp'})
  .then((res) => {
    console.log('res', res)
    var params = {Bucket: 'vid_decomp', Key: 'test', Body: 'testStr'};

    return s3.putObjectAsync(params);
  })
  .then(data => {
    console.log('data', data);
  })
  .catch(throwErr);
}

function throwErr (err) {
  console.log(err);
  throw err;
}  
