function salt_userSettings_testUserPass(u, p) {
    return $.ajax({
        url: '/api/salt/auth',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            username: u,
            password: p
        })
    });
}
function salt_userSettings_saveUserPass(u, p) {
    return $.ajax({
        url: '/api/account/plugins/salt/salt_settings',
        type: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify({
            salt_user: u,
            salt_pass: p
        })
    });
}

$.ajax({
    url: '/api/account/plugins/salt',
    type: 'OPTIONS'
}).fail((err) => {
    return false;
}).done((res) => {
    var uform = $('<ul>', {
        id: 'salt_userSettingsForm',
        class: 'objectList formInputList'
    });
    var uName = $('<li>', {
        class: 'objectItem formInputListItem',
    });
    var uNameLabel = $('<label>', {
        class: 'objectItemLabel standardWidth',
        text: 'API Username',
        for: 'salt_userSettings_username'
    });
    var uNameInput = $('<input>', {
        type: 'text',
        id: 'salt_userSettings_username',
    });
    var uPass = $('<li>', {
        class: 'objectItem formInputListItem'
    });
    var uPassLabel = $('<label>', {
        class: 'objectItemLabel standardWidth',
        text: 'API Password',
        for: 'salt_userSettings_password',
    });
    var uPassInput = $('<input>', {
        type: 'password',
        id: 'salt_userSettings_password',
    });
    if (typeof res.identity.salt_api_username != "undefined") {
        uNameInput.val(res.identity.salt_api_username);
    }
    if (typeof res.identity.salt_api_password != "undefined") {
        uPassInput.val(res.identity.salt_api_password);
    }
    if (res.flags.salt_api_per_user === true) {
        var api_host = "api.master.place.com",
            api_port = 443,
            api_ssl = true;
        if (typeof res.identity.api_host != "undefined") {
            api_host = res.identity.api_host;
            api_port = res.identity.api_port;
            api_ssl = res.identity.api_ssl;
        }
        var apiHostLine = $('<li>', {
            class: 'objectItem formInputListItem'
        });
        var apiHostLabel = $('<label>', {
            class: 'objectItemLabel standardWidth',
            text: 'API Hostname',
            for: 'salt_userSettings_apiHostInput'
        });
        var apiHostInput = $('<input>', {
            type: 'text',
            id: 'salt_userSettings_apiHostInput',
            value: api_host
        });
        apiHostLine.append(apiHostLabel, apiHostInput);
        var apiPortLine = $('<li>', {
            class: 'objectItem formInputListItem'
        });
        var apiPortLabel = $('<label>', {
            class: 'objectItemLabel standardWidth',
            text: 'API Port',
            for: 'salt_userSettings_apiPortInput'
        });
        var apiPortInput = $('<input>', {
            type: 'number',
            id: 'salt_userSettings_apiPortInput',
            min: 1,
            max: 65535,
            value: api_port
        });
        apiPortLine.append(apiPortLabel, apiPortInput);
        var apiSslLine = $('<li>', {
            class: 'objectItem formInputListItem'
        });
        var apiSslLabel = $('<label>', {
            class: 'objectItemLabel standardWidth',
            text: 'Verify API Certificate',
            for: 'salt_userSettings_apiSslInput'
        });
        var apiSslInput = $('<input>', {
            type: 'checkbox',
            id: 'salt_userSettings_apiSslInput',
            checked: api_ssl
        });
        apiSslLine.append(apiSslLabel, apiSslInput);
        uform.append(apiHostLine, apiPortLine, apiSslLine);
    }
    uPassInput.attr({'autocomplete': 'off', 'autocapitalize': 'off'});
    uNameInput.attr({'autocomplete': 'off', 'autocapitalize': 'off'});
    uPass.append(uPassLabel, uPassInput);
    uName.append(uNameLabel, uNameInput);
    uform.append(uName, uPass);
    $('#userSettingsContent').html(uform);
    $('#userSettingsContent').prepend($('<h3 class="salt_sectionTitle">Salt User Settings</h3>'));
    
    var uTest = $('<button>', {
        id: 'salt_userSettings_test',
        text: 'Test Settings'
    });
    var uSubmit = $('<button>', {
        id: 'salt_userSettings_submit',
        text: 'Save Settings'
    });
    $('#userSettingsSubmitTools').append(uTest, uSubmit);
    uTest.on("click", () => {
        var username = $('#salt_userSettings_username').val();
        var password = $('#salt_userSettings_password').val();
        salt_userSettings_testUserPass(username, password)
        .done((res) => {
            if (res.result === true) {
                uTest.hide(0);
                $('#salt_userSettings_submit').show(0);
                return true;
            } else {
                alert('Those credentials do not work. Try again, little buddy!');
                return false;
            }
        })
        .fail((err) => {
            alert('Those credentials do not work. Try again, little buddy!');
            return false;
        })
    });
    uSubmit.on("click", () => {
        var username = $('#salt_userSettings_username').val();
        var password = $('#salt_userSettings_password').val();
        salt_userSettings_saveUserPass(username, password)
        .done((res) => {
            console.log(res);
        })
        .fail((err) => {
            console.log('bad', err);
        })
    });
});