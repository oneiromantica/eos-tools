"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"])_i["return"]();}finally{if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else{throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var _BitField=require("./BitField");var _BitField2=_interopRequireDefault(_BitField);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}
var State=function State(initial){var _ref=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{},_ref$compress=_ref.compress,compress=_ref$compress===undefined?function(x){return x;}:_ref$compress,_ref$uncompress=_ref.uncompress,uncompress=_ref$uncompress===undefined?function(x){return x;}:_ref$uncompress;var Base65=BaseConvert();var getKeysOfType=function getKeysOfType(typeName){return Object.keys(initial).filter(function(key){return _typeof(initial[key])===typeName;});};var boolValues=getKeysOfType("boolean");var numberValues=getKeysOfType("number");var stringValues=getKeysOfType("string");var bitFields=Object.keys(initial).filter(function(key){return Array.isArray(initial[key]);});var fieldSeparator="|";var groupSeparator="$";var mergeObj=function mergeObj(a,b){var result={};Object.keys(a).forEach(function(key){return result[key]=a[key];});Object.keys(b).forEach(function(key){return result[key]=b[key];});return result;};var compressBools=function compressBools(store){var boolField=boolValues.reduce(function(bf,key,idx){return store[key]?_BitField2.default.setAt(idx,bf):_BitField2.default.clearAt(idx,bf);},_BitField2.default.of(boolValues.length));return _BitField2.default.toBase65(boolField);};var serializeStrings=function serializeStrings(store){return stringValues.map(function(key){return store[key];}).join(fieldSeparator);};var serializeNumbers=function serializeNumbers(store){return numberValues.map(function(key){return Base65.encode(store[key]);}).join(fieldSeparator);};var serializeBitFields=function serializeBitFields(store){return bitFields.map(function(key){return _BitField2.default.toBase65(store[key]);});};var parseBools=function parseBools(str){var bools=_BitField2.default.fromBase65(str);return boolValues.reduce(function(acc,key,idx){acc[key]=_BitField2.default.getAt(idx,bools);return acc;},{});};var parseValues=function parseValues(keys,fromString){return function(str){return str.split(fieldSeparator).reduce(function(acc,stringVal,idx){acc[keys[idx]]=fromString(stringVal);return acc;},{});};};var parseStrings=parseValues(stringValues,function(x){return x;});var parseNumbers=parseValues(numberValues,Base65.decode);var parseBitFields=parseValues(bitFields,_BitField2.default.fromBase65);var serialize=function serialize(store){return compress(serializeNumbers(store)+groupSeparator+serializeStrings(store)+groupSeparator+compressBools(store)+groupSeparator+serializeBitFields(store));};var parse=function parse(str){var _uncompress$split=uncompress(str).split(groupSeparator),_uncompress$split2=_slicedToArray(_uncompress$split,4),numbers=_uncompress$split2[0],strings=_uncompress$split2[1],bools=_uncompress$split2[2],bitFields=_uncompress$split2[3];return[parseNumbers(numbers),parseStrings(strings),parseBools(bools),parseBitFields(bitFields)].reduce(mergeObj,{});};var overwriteM=function overwriteM(target,value){Object.keys(value).forEach(function(k){if(target[k]!==value[v])target[k]=value[v];});};return{parse:parse,initialize:function initialize(store){return void overwriteM(store,initial);},hydrate:function hydrate(store,compressedState){return void overwriteM(store,parse(compressedState));},serialize:serialize};};window&&(window.State=State);exports.default=State;