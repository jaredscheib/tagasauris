'use strict';

const Firebase = require('firebase');

const firebase_secrets = require('../common/secrets/scrape-img.js').firebase;

const dbRef = new Firebase(firebase_secrets.url);

function pushAndAddUID(sourceObj) {
  console.log(`attempt to pushAndAddUID`)
  let targetBucket = sourceObj.s3_key.split('/').slice(0,2).join('/');
  // console.log('targetBucket', targetBucket);
  let targetRef = dbRef.child(targetBucket) || dbRef.child('img_ref3');
  const item = sourceObj;
  return new Promise((resolve, reject) => {
    targetRef.push(item)
    .then(tempRef => {
      tempRef.update({ uid: tempRef.key() });
      console.log('pushAndAddUID success', typeof tempRef);
      resolve(tempRef); // return updated obj ref
    })
    .catch(err => {
      resolve(null);
    })
  });
}

function postImgObjSetToFirebase(allImgData) {
  // console.log('returned final promise result', allImgData);
  return Promise.all(allImgData.map(imgData => pushAndAddUID(imgData, dbRef.child(imgRef))));
}

module.exports = {
  dbRef: dbRef,
  pushAndAddUID: pushAndAddUID,
}
