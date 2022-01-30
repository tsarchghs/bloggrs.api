
module.exports = obj => {
    let keys = Object.keys(obj);
    let new_obj = {};
    for (let key of keys){
        if (obj[key] !== undefined && obj[key] !== null) new_obj[key] = obj[key];
    }
    return new_obj;
}