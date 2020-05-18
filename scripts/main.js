'use strict';

let element, text;

function getRegexp(keyPart, valuePart)
{
    const start = "(^|<div>|<br>)\\s*";
    const delimiter = "(\\s|&nbsp;)*[:-]*(\\s|&nbsp;)*";
    const end = "\\s*($|&nbsp;|<\/div>|<br>)";

    return new RegExp(start + keyPart + delimiter + valuePart + end, "img");
}

function getText(element) {

    let text = element.text();
    let rhost = getRegexp("(host|domain|server)+", "([a-z0-9.]{3,})");

    if (text.match(rhost) === null) {
        text = element.html();
    }

    return text;
}

function getHostname()
{
    let rhost = getRegexp("(host|domain|server)+", "([a-z0-9\.\-]{3,})");
    let hosts = [];
    text.match(rhost) && text.match(rhost).forEach(function(host){
        hosts.push(host.replace(rhost, "$5"));
    });
    // console.log(hosts);

    return hosts.slice(-1).pop();
}

function getUsername()
{
    let ruser     = getRegexp("(user|username|login)", "([a-zA-Z0-9\\-@._]{3,})");
    let usernames = [];
    text.match(ruser) && text.match(ruser).forEach(function(username){
        usernames.push(username.replace(ruser, "$5"));
    });
    // console.log(usernames);

    return usernames.pop();
    // return usernames.slice(-1).pop();
}

function getPassword()
{
    let rpassword = getRegexp("(pass|password|pw|pwd)", "([A-Za-z\\d@$!%*#?&_\/\.\:)(]{4,})");
    let passwords = [];
    text.match(rpassword) && text.match(rpassword).forEach(function(password){
        passwords.push(password.replace(rpassword, "$5"));
    });
    // console.log(passwords);

    return passwords.pop();
    // return passwords.slice(-1).pop();
}

function getWorkingDir()
{
    let rpath     = getRegexp("(path|dir)+", "([~\\.A-Za-z\\d-\\/\\\\]{3,})");
    let path = '';
    text.match(rpath) && text.match(rpath).forEach(function(tpath){
        path = tpath.replace(rpath, "$5");
    });
    // console.log(path);

    return path;
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

    let port = getPort();
    let path = getWorkingDir();

    return 'sftp://' +
        getUsername() + ':' +
        getPassword() + '@' +
        getHostname() +
        (port ? ':' + port : '') +
        (path ? '/' + path : '');
}

function getSsh()
{
    let port = getPort();

    return 'ssh ' +
        getUsername() + '@' +
        getHostname() +
        (port ? ' -p ' + port : '');
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
    pass = getPassword();
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