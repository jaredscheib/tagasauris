'use strict';

const Promise = require('bluebird');
const Firebase = require('firebase');
const dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
const _ = require('../public/util/utils.js');

function deleteSet (path) {
  return dbRef.child(path).remove();
}

function createDuplicateSet (backup, path2) {
  backup = backup || 'img_ref_backup20160217';
  path2 = path2 || 'img_ref';
  return new Promise((fulfill, reject) => {
    dbRef.child(backup).once('value', function(snapshot) {
      var obj = snapshot.val();
      dbRef.child(path2).set(obj)
      .then(val => {
        if (val === null) console.log(`Created duplicate of ${backup} at ${path2}`);
        fulfill();
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
    });
  });
}

function createTaskKeysForSets (path, task) {
  path = path || 'img_ref';
  task = task || 'task_img_verification';

  return new Promise((fulfill, reject) => {
    dbRef.child(path).once('value', snapshot => {
      let data = snapshot.val();
      console.log('hello');
      console.log(Object.keys(data).length);
      fulfill(data);
    })
  })
  .then(allConceptData => {
    console.log('yes', typeof allConceptData, Object.keys(allConceptData).length);
    for (let conceptKey in allConceptData) {
      let concept = allConceptData[conceptKey];
      console.log('what', concept);
      for (let uidKey in concept) {
        let imgObj = concept[uidKey];
        console.log('zee', imgObj);
        if (imgObj[task] === undefined) {
          // let mod = _.deepClone(concept[uidKey]);
          dbRef.child(path).child(conceptKey).child(uidKey).child(task).set(0)
          .then(ref => {
            console.log(`readied obj for ${task} at ${path}/${conceptKey}/${task}`);
          });
        }
      }
    }
  });
}

function resetImgRefSet (path) {
  // return deleteSet(path).then(x => {
    // return deleteSet('task_img_verification_results').then(x => {
  return createDuplicateSet('img_ref_backup20160217', path).then(x => {
  return createTaskKeysForSets(path, 'task_img_verification')}).then(x => {
  return createTaskKeysForSets(path, 'task_img_bounding_box')}).catch(console.log.bind(console));
}

// resetImgRefSet('img_ref')
// resetImgRefSet('img_ref2');
