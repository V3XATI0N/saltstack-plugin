var wblock = $('<div>', {
    id: 'salt_waitBlock',
});
var wnote = $('<div>', {
    id: 'salt_waitBlockNote',
    text: 'wait for verification ...'
});
$('body').prepend(wblock.append(wnote));
$.ajax({
    url: "/api/salt/auth",
    type: "GET"
}).fail(function(err) {
    wblock.remove();
    alert(err.responseText);
}).done(function(res) {
    wblock.remove();
    alert("salt authentication succeeded.");
});