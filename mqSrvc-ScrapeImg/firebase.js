'use strict';

const Firebase = require('firebase');

const firebase_secrets = require('../common/secrets/scrape-img.js').firebase;

const dbRef = new Firebase(firebase_secrets.url);

function pushAndAddUID(sourceObj) {
  console.log(`attempt to pushAndAddUID`)
  // let targetBucket = sourceObj.s3_key.split('/').slice(0,2).join('/');
  // console.log('targetBucket', targetBucket);
  let targetRef = dbRef.child('img_ref') || dbRef.child('img_ref3');
  const item = sourceObj;
  return new Promise((resolve, reject) => {
    targetRef.push(item)
    .then(tempRef => {
      item.uid = tempRef.path.u[1];
      tempRef.update({ uid: item.uid });
      // console.log('tempRef', tempRef);
      resolve(tempRef); // return updated obj ref
    })
    // .then(() => {
    //   // console.log(`item at ${targetRef.path.u[0]}/${item.uid} updated`);
    // })
    .catch((err) => {
      sendErr(err);
      reject(err);
    });
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
