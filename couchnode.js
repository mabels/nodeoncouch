/*
    Tend to be ugly!!!
 */
var fs = require('fs');
var util = require('util');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

var readline = function(fn) {
	queue = [];
	process.stdin.on('data', function(chunk) {
		var str = chunk.toString('utf-8');
		var nl_idx = str.indexOf("\n");
		if (nl_idx >= 0) {
			queue.push(str.slice(0,nl_idx));	
			fn(queue.join(''));			
			queue = [];
		} else {
			queue.push(str);	
		}
	});
}

/*
["reset",{"reduce_limit":true}]
["add_fun","function(doc) {\n  emit(doc._id, doc);\n}"]
["map_doc",{"_id":"aee2c21850f5d93c4721678c2222d188","_rev":"1-2f3b2ad036d77d47ce25270740aeaff2","keys":["d","c"]}]
*/

/*
[[["aee2c21850f5d93c4721678c2222d188a",{"_id":"aee2c21850f5d93c4721678c2222d188","_rev":"1-2f3b2ad036d77d47ce25270740aeaff2","keys":["d","c"]}],["aee2c21850f5d93c4721678c2222d188b",{"_id":"aee2c21850f5d93c4721678c2222d188","_rev":"1-2f3b2ad036d77d47ce25270740aeaff2","keys":["d","c"]}],["aee2c21850f5d93c4721678c2222d188c",{"_id":"aee2c21850f5d93c4721678c2222d188","_rev":"1-2f3b2ad036d77d47ce25270740aeaff2","keys":["d","c"]}]]]
*/

var current_fn = null;
var out_data = [];
readline(function(line) {
//console.error('LINE='+line);
	var op = JSON.parse(line);
	var emit = function(key, val) {
//console.error('EMIT:'+key+"="+val);
		out_data.push([key, val]);
	}
	var out = (({
		reset:   function(opts) { 
//		console.error(util.inspect(opts)); 
			return true; 
		},		
		add_fun: function(fn)   { 
			eval("current_fn = "+fn); 
//console.error('FN='+current_fn);
			return true;
		},		
// [[["aee2c21850f5d93c4721678c2222d1885",{"_id":"aee2c21850f5d93c4721678c2222d188","_rev":"1-2f3b2ad036d77d47ce25270740aeaff2","keys":["d","c"]}]]]
		map_doc: function(data) { 
			try {
				out_data = [];
				current_fn(data); 
				return [out_data];
			} catch(e) {
console.error('MAP_DOC:ERROR:'+e);
				return [[[]]];
			}
		}
	})[op[0]])(op[1]);
	if (out !== null) {
//		console.error('OUT='+out);
		process.stdout.write(JSON.stringify(out)+"\n", 'utf-8');
	}
})
