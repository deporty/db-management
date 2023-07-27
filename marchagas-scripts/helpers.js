function parseInformation(data) {
  let response = null;
  const value = data;

  if (Array.isArray(value)) {
    const tempArray = [];
    for (const item of value) {
      tempArray.push(parseInformation(item));
    }
    response = {
      type: "Array",
      value: tempArray,
    };
  } 
  else if (typeof value === "object" && value instanceof Date) {
    const temp = {};
   
    

    response = {
      type: "date",
      value: value.toISOString(),
    };
  }
  
  else if (typeof value === "object") {
    const temp = {};
    for (const key in value) {
      const element = value[key];
      temp[key] = parseInformation(element);
    }

    response = {
      type: "object",
      value: temp,
    };
  } else {
    response = {
      type: typeof value,
      value: value,
    };
  }
  return response;
}

exports.parseInformation = parseInformation;
