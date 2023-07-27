const moment = require("moment");

export function generateDocumentReference(data, admin) {
  const fragments = data.split("/");
  const _ = (db, flag, fragments, i) => {
    if (i < fragments.length) {
      if (flag) {
        return _(db.collection(fragments[i]), !flag, fragments, i + 1);
      } else {
        return _(db.doc(fragments[i]), !flag, fragments, i + 1);
      }
    } else {
      return db;
    }
  };
  let db = admin.firestore();
  const response = _(db, true, fragments, 0);
  return response;
}
export function uparseItem(data) {
  let response = null;
  if (data.type == "Array") {
    const tempArray = [];
    for (const item of data.value) {
      const temo = uparseItem(item);
      tempArray.push(temo);
    }
    response = tempArray;
  } else if (data.type == "date") {
    response = moment(data.value).toDate();
  } else if (data.type == "reference") {
    response = generateDocumentReference(data.value);
  } else if (data.type === "object") {
    const temp = {};
    for (const key in data.value) {
      const element = data.value[key];
      temp[key] = uparseItem(element);
    }

    response = temp;
  } else {
    response = data.value;
  }
  return response;
}
