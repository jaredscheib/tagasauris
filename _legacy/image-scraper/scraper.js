'use strict';

const altSearchEngines = require('./scraper-alt-engines.js');
const googleImages = require('google-images');

const secrets = require('./secrets.js');
const Firebase = require('firebase');
const Promise = require('bluebird');
const googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY);

const dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
const imgRef = 'img_ref';

// const args = process.argv.slice(2);
// const queryStr = String(args[0]);
// const resultsCnt = Number(args[1]);
// const taskNameStr = String(args[2]) || 'task_img_verification';

function flattenArray(arrTwoDim) {
  return [].concat.apply([], arrTwoDim);
}
function flattenObj(obj, modOption) {
  Object.keys(obj).forEach(prefix => {
    if (typeof obj[prefix] === 'object' && !Array.isArray(obj[prefix])) {
      Object.keys(obj[prefix]).forEach(key => {
        obj[`${prefix}_${key}`] = obj[prefix][key];
      });
      delete obj[prefix];
      Object.keys(modOption).forEach(key => {
        obj[key] = modOption[key];
      });
    }
  });
  return obj;
}
function sendErr(err) {
  console.log(err);
  return 503;
}
function getImgData(queryString, _imgTotal) {
  const imgDataToResolve = [];
  _imgTotal = _imgTotal < 10 ? 10 : _imgTotal;
  const imgTotal = Math.round(_imgTotal / 10) * 10 || 200;
  for (let startIndex = 1; startIndex < imgTotal; startIndex += 10) {
    // .search options arg: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    const queryOptions = {
      start: String(startIndex),
      imgType: 'photo' // todo - re-modify node package & find imgType bug workaround
    };
    imgDataToResolve.push(googleClient.search(queryString, queryOptions));
  }

  return Promise.all(imgDataToResolve)
  .then(imgData => {
    // console.log('imgData', imgData);
    const flatImgData = flattenArray(imgData).map(obj => flattenObj(obj, { query: queryString }));
    // let fileName = query.slice().split(' ').join('_')
    return flatImgData;
  })
  .catch(sendErr);
  // console.log(queryString, startIndex, imgTotal);// todo mix and deduplicate results from alt engines
}
function pushAndAddUID(targetRef, sourceObj) {
  const item = sourceObj;
  return new Promise((resolve, reject) => {
    targetRef.push(item)
    .then(tempRef => {
      item.uid = tempRef.path.u[1];
      resolve(tempRef.update({ uid: item.uid }));
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
function postImgDataToFirebase(allImgData) {
  // console.log('returned final promise result', allImgData);
  return Promise.all(allImgData.map(imgData => pushAndAddUID(dbRef.child(imgRef), imgData)));
}
function fetchAndStore(queryString, resultsCount) {
  Firebase.goOnline();
  return getImgData(queryString, resultsCount)
  .then(postImgDataToFirebase)
  // .then(promiseData => {
  //   console.log('promiseData', promiseData);
  // })
  .catch(sendErr);
}
function createTicketsPool(taskName) {
  return new Promise((resolve, reject) => {
    dbRef.child(imgRef).once('value', (snapshot) => {
      let imgData = snapshot.val();
      const allPromises = [];
      for (const UID in imgData) {
        if (imgData.hasOwnProperty(UID)) {
          const poolTicket = {
            img_ref_uid: UID,
            // status: true // true === open; false === closed
          };
          // imgData[UID].url = imgData[UID].s3_url;
          allPromises.push(pushAndAddUID(dbRef.child(`${taskName}_tickets_pool`), poolTicket));
        }
      }
      Promise.all(allPromises)
      .then(() => {
        // dbRef.child('img_ref3').set(imgData);
        console.log('created tickets');
        Firebase.goOffline();
        resolve(200);
      })
      .catch((err) => {
        sendErr(err);
        reject(err);
      });
    });
  });
}
// function fetchAndStoreAndPrepareTask(queryString, resultsCount, taskName) {
//   fetchAndStore(queryString, resultsCount)
//   .then(createTicketsPool(taskName))
//   .then(() => { console.log('created tickets'); Firebase.goOffline(); return 200; })
//   .catch(sendErr);
// }

// if (queryStr && resultsCnt) {
//   fetchAndStore(queryStr, resultsCnt);
// }

createTicketsPool('task_img_verification_trinary');
// createTicketsPool('task_img_verification');

module.exports.fetchAndStore = fetchAndStore;
module.exports.createTicketsPool = createTicketsPool;
