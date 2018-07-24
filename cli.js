#!/usr/bin/env node
'use strict';
var path = require('path');
var fs = require('fs');
var execSync = require('child_process').execSync;

// execute cmd
function execute(cmd) {
    try {
        var stdout = execSync(cmd);
        return stdout.toString();
    } catch (ex) {
        console.error('execute failed: ' + cmd + ', error: ' + ex);
        return '';
    }
}

// for finding the cli location
var cliFinder = {
    darwin: function() {
        return '/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli';
    },

    win32: function() {
        var regInfo = execute('reg query "HKLM\\SOFTWARE\\WOW6432Node\\Tencent\\微信web开发者工具" /ve');
        var match = /REG_SZ\s+(\S.+)/.exec(regInfo);
        if (!match) {
            // unknown in registry - give a guess with default localtion
            return '';
        }
        return path.join(path.dirname(match[1]), 'cli.bat');
    },
}

// for killing wechatdevtools instances
var cliCleaner = {
    darwin: function() {
        execute("ps axco pid,command | grep wechatdevtools | awk '{ print $1; }' | xargs kill -9");
    },
    win32: function() {
        execute('taskkill /FI "IMAGENAME eq wechatdevtools.exe" /F');
    },
}


var cli = cliFinder[process.platform]();
if (!cli || !fs.existsSync(cli)) {
    console.error('cannot find installed wechatdevtools');
    process.exit(1);
}

// parse commandline and handle it
var args = process.argv.slice(2);
if (args.length === 0) {
    console.log('usage: wechatdevtools [ --kill | <cli options> ]');
    process.exit(0);
}

if (args[0] === '--kill') {
    console.log('killing running instances...');
    cliCleaner[process.platform]();
    process.exit(0);
}

var out = execute(cli + ' ' + args.join(' '));
console.log(out);
process.exit(0);
