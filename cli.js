#!/usr/bin/env node
'use strict';
var path = require('path');
var fs = require('fs');
var execSync = require('child_process').execSync;

// execute cmd sync with return value
function execute(cmd) {
    try {
        var stdout = execSync(cmd);
        return stdout.toString();
    } catch (ex) {
        console.error('execute failed: ' + cmd + ', error: ' + ex);
        return '';
    }
}

// execute cmd with stdout inherit
function executeVoid(cmd) {
    try {
        execSync(cmd, { stdio: [0, 1, 2] });
        return true;
    } catch (ex) {
        console.error('execute failed: ' + cmd + ', error: ' + ex);
        return false;
    }
}

function addQuoteToCmd(cmd) {
    if (!cmd) {
        return cmd;
    }
    if (cmd.indexOf(' ') === -1 || /^"[^"]+"$/.test(cmd) || /^'[^']+'$/.test(cmd)) {
        return cmd;
    }
    return '"' + cmd + '"';
}

function addQuoteToArgs(args) {
    return args.map(function (arg) {
        return addQuoteToCmd(arg);
    });
}

// for finding the cli location
var cliFinder = {
    darwin: function () {
        return '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
    },

    win32: function () {
        var regInfo = execute(
            'reg query "HKLM\\SOFTWARE\\WOW6432Node\\Tencent\\微信web开发者工具" /ve',
        );
        var match = /REG_SZ\s+(\S.+)/.exec(regInfo);
        if (!match) {
            // unknown in registry - give a guess with default localtion
            return '';
        }
        return addQuoteToCmd(path.join(path.dirname(match[1]), 'cli.bat'));
    },
};

// for killing wechatdevtools instances
var cliCleaner = {
    darwin: function () {
        execute("ps axco pid,command | grep wechatdevtools | awk '{ print $1; }' | xargs kill -9");
    },
    win32: function () {
        execute('taskkill /FI "IMAGENAME eq wechatdevtools.exe" /F');
    },
};

var cli = cliFinder[process.platform]();
if (!cli || !fs.existsSync(cli)) {
    console.error('cannot find installed wechatdevtools');
    process.exit(1);
}

// parse commandline and handle it
var args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    executeVoid(cli + ' -h');
    console.log('  --kill         Kill all IDE processes');
    process.exit(0);
}

if (args[0] === '--kill') {
    console.log('killing running IDE processes...');
    cliCleaner[process.platform]();
    process.exit(0);
}

var success = executeVoid(cli + ' ' + addQuoteToArgs(args).join(' '));
if (success) {
    process.exit(0);
}
process.exit(1);
