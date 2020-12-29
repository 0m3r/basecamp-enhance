'use strict';

let element, text;

function getRegexp(keyPart, valuePart)
{
    const start = "(^|<div>|<br>|<pre>|\s)\\s*";
    const delimiter = "(\\s|&nbsp;)*[:-]*(\\s|&nbsp;)*";
    const end = "\\s*($|&nbsp;|<\/div>|<br>|<\/pre>)";

    return new RegExp(start + keyPart + delimiter + valuePart + end, "img");
}

function getText(element) {

    let text = element.html();
    let rhost = getRegexp("(host|hostname|domain|server|ip)+", "([a-z0-9\.\-]{3,})");

    if (text && text.match && text.match(rhost) === null) {
        text = element.text();
    }
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/<br\/>/g, ' ');
    text = text.replace(/<br>/g, "\n");

    return text;
}

function getHostname()
{
    let rhost = getRegexp("(host|hostname|domain|server|ip)+", "([a-z0-9\.\-]{3,})");
    let hosts = [];
    text.match(rhost) && text.match(rhost).forEach(function(host){
        hosts.push(host.replace(rhost, "$5"));
    });
    // console.log(hosts);

    return hosts.slice(-1).pop();
}

function getUsernames()
{
    let ruser     = getRegexp("(user|username|login|U)", "([a-zA-Z0-9\\-@._]{3,})");
    let usernames = [];
    text.match(ruser) && text.match(ruser).forEach(function(username){
        usernames.push(username.replace(ruser, "$5"));
    });
    // console.log(usernames);

    return usernames;
    // return usernames.slice(-1).pop();
}

function getUsername()
{
    let usernames = getUsernames();

    return usernames.pop();
    // return usernames.slice(-1).pop();
}

function getIndicesOf(searchStr, str, caseSensitive) {
    if (typeof searchStr === "undefined") {
        return [];
    }
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function getUsernameByHost(host)
{
    let usernames = getUsernames();
    let username;
    let minLength = text.length + 10;

    getIndicesOf(host, text, true).forEach(hostIndex => {
        usernames.forEach(tusername => {
            getIndicesOf(tusername, text, true).forEach(usernameIndex => {
                let length = Math.abs(hostIndex - usernameIndex);
                if (minLength > length) {
                    minLength = length;
                    username = tusername;
                }
            });
        });
    });

    if (!username) {
        username = usernames.pop();
    }

    return username;
    // return usernames.pop();
    // return usernames.slice(-1).pop();
}

function getPasswords()
{
    let rpassword = getRegexp("(pass|Pass|password|pw|pwd|P|PS)", "([A-Za-z\\d@$!%*#?&_\\-\`\'\"\.\:\;\^\)\(\}\{\/\[]{4,})");
    let passwords = [];
    text.match(rpassword) && text.match(rpassword).forEach(function(password){
        passwords.push(password.replace(rpassword, "$5"));
    });
    // console.log(passwords);

    return passwords;
}

function getPassword()
{
    let passwords = getPasswords();

    return passwords.pop();
    // return passwords.slice(-1).pop();
}

function getPasswordByUsername(username)
{
    let passwords = getPasswords();
    let password;
    let minLength = text.length + 10;

    getIndicesOf(username, text, true).forEach(usernameIndex => {
        passwords.forEach(tpassword => {
                getIndicesOf(tpassword, text, true).forEach(passwordIndex => {
                const length = Math.abs(usernameIndex - passwordIndex);
                if (minLength > length) {
                    minLength = length;
                    password = tpassword;
                }
            });
        });
    });

    if (!password) {
        password = passwords.pop();
    }
    return password;
    // return passwords.pop();
    // return passwords.slice(-1).pop();
}

function getWorkingDir()
{
    let rpath = getRegexp("(path|dir|web root|root|homedir|folder|Folder)+", "([~\\.A-Za-z\\d-\\/\\\\_]{3,})");
    let paths = [];
    text.match(rpath) && text.match(rpath).forEach(function(tpath){
        paths.push(tpath.replace(rpath, "$5"));
    });

    return paths.pop();
}

function getPort()
{
    let rport     = getRegexp("(ssh|ftp)*\s*port", "(\\d+)");
    let port = '';

    text.match(rport) && text.match(rport).forEach(function(tport) {
        port = tport.replace(rport, "$5");
    });
    // console.log(port);

    return port;
}

function getFtps() {

    const host = getHostname();
    // const user = getUsername();
    const user = getUsernameByHost(host);
    // const pass = getPassword();
    const pass = getPasswordByUsername(user);
    const port = getPort();
    const path = getWorkingDir();


    return 'sftp://' +
        user + ':' +
        pass + '@' +
        host +
        (port ? ':' + port : '') +
        (path ? '/' + path : '');
}

function getSsh()
{
    const host = getHostname();
    const user = getUsernameByHost(host);
    let port = getPort();

    return 'ssh ' + user + '@' + host + (port ? ' -p ' + port : '');
}

element = $('.formatted_content').eq(0);
text = getText(element);

(function () {
    let ftps, ssh, pass, path;

    if ($('.formatted_content').eq(0).length === 0) {
        return;
    }

    ftps = getFtps();
    ssh = getSsh();
    // pass = getPassword();
    pass = getPasswordByUsername(
        getUsernameByHost(
            getHostname()
        )
    );
    path = getWorkingDir();

    function addButton(idSuffix, text)
    {
        return '<button id="basecamp-enchance-' + idSuffix +  '"' +
            'data-clipboard-text="' + text + '">' +
            'Copy' +
        '</button>'
    }

    element.after(
        '<div>' +
            ftps +
            addButton('ftp', ftps) +
        '</div>'  +

        '<div>' +
            ssh +
            addButton('ssh', ssh) +
        '</div>' +

        '<div>' +
             pass + '  ' +
             addButton('pass', pass) +
        '</div>' +

        (path ? '<div>' +
             'cd ' + path + '  ' +
             addButton('path', 'cd ' + path) +
        '</div>' : '') +

        '<p></p>'
    );

    $('button#basecamp-enchance-ftp').click(function(){
        $(this).CopyToClipboard();
    });

    $('button#basecamp-enchance-ssh').click(function(){
        $(this).CopyToClipboard();
    });

    $('button#basecamp-enchance-pass').click(function(){
        $(this).CopyToClipboard();
    });

    $('button#basecamp-enchance-path').click(function(){
        $(this).CopyToClipboard();
    });
})();