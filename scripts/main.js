'use strict';

var element = $('.formatted_content').eq(0);
var text;

function getRegexp(keyPart, valuePart)
{
    const start = "(^|<div>|<br>)\\s*";
    const delimiter = "(\\s|&nbsp;)*[:-]*(\\s|&nbsp;)*";
    const end = "\\s*($|&nbsp;|<\/div>|<br>)";

    return new RegExp(start + keyPart + delimiter + valuePart + end, "img");
}

function getText() {

    var text = element.text();
    var rhost = getRegexp("(host|domain|server)+", "([a-z0-9.]{3,})");
    if (text.match(rhost) === null) {
        text = element.html();
    }
    return text;
}

text = getText();

function getHostname()
{
    var rhost = getRegexp("(host|domain|server)+", "([a-z0-9.]{3,})");
    var hosts = [];
    text.match(rhost) && text.match(rhost).forEach(function(host){
        hosts.push(host.replace(rhost, "$5"));
    });
    // console.log(hosts);
    return hosts.slice(-1).pop();
}

function getUsername ()
{
    var ruser     = getRegexp("(user|username|login)", "([a-zA-Z0-9\\-@.]{3,})");
    var usernames = [];
    text.match(ruser) && text.match(ruser).forEach(function(username){
        usernames.push(username.replace(ruser, "$5"));
    });
    // console.log(usernames);
    return usernames.slice(-1).pop();
}

function getPassword()
{
    var rpassword = getRegexp("pass(word)*", "([A-Za-z\\d@$!%*#?&)(]{4,})");
    var passwords = [];
    text.match(rpassword) && text.match(rpassword).forEach(function(password){
        passwords.push(password.replace(rpassword, "$5"));
    });
    // console.log(passwords);
    return passwords.slice(-1).pop();
}

function getWorkingDir()
{
    var rpath     = getRegexp("(path|dir)+", "([~\\.A-Za-z\\d-\\/\\\\]{3,})");
    var path = '';
    text.match(rpath) && text.match(rpath).forEach(function(tpath){
        path = tpath.replace(rpath, "$5");
    });
    // console.log(path);
    return path;
}

function getPort()
{
    var rport     = getRegexp("(ssh|ftp)*\s*port", "(\\d+)");
    var port = '';

    text.match(rport) && text.match(rport).forEach(function(tport) {
        port = tport.replace(rport, "$5");
    });
    // console.log(port);
    return port;
}

function getFtps() {

    var port = getPort();
    var path = getWorkingDir();

    return 'sftp://' +
        getUsername() + ':' +
        getPassword() + '@' +
        getHostname() +
        (port ? ':' + port : '') +
        (path ? '/' + path : '');
}

function getSsh()
{
    var port = getPort();

    return 'ssh ' +
        getUsername() + '@' +
        getHostname() +
        (port ? ' -p ' + port : '');
}

var ftps = getFtps();
var ssh = getSsh();
var pass = getPassword();

element.after(
    '<div>' +
        ftps +
        '<button id="basecamp-enchance-ftp"' +
            'data-clipboard-text="' + ftps + '">' +
            'Copy FTPs' +
        '</button>' +
    '</div>'  +

    '<div>' +
        ssh +
        '<button id="basecamp-enchance-ssh"' +
            'data-clipboard-text="' + ssh + '">' +
            'Copy SSH' +
        '</button>' +
    '</div>' +

    '<div>' +
         pass + '  ' +
        '<button id="basecamp-enchance-ssh"' +
            'data-clipboard-text="' + pass + '">' +
            'Copy password' +
        '</button>' +
    '</div>' +
    '<p></p>'
);

$('button#basecamp-enchance-ftp').click(function(){
    $(this).CopyToClipboard();
});
