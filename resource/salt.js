function grainStore(minion, set = null) {
    if (set === null) {
        return JSON.parse(atob(localStorage.getItem(minion + '_grains')));
    } else {
        localStorage.setItem(minion + '_grains', btoa(JSON.stringify(set)));
    }
}
function getMinionPage(minion, activePage = 'info', output = '#minionContent') {
    var blockWaitTop =$('<div>', {class: 'loading_place'});
    var pageGrid = $('<div>', {class: 'gridTop'});
    var pageLeft = $('<div>', {class: 'gridLeft nav narrow-padding'});
    var pageRight = $('<div>', {class: 'gridright content', id: 'minionModuleContent'});
    var grains = grainStore(minion);
    $(output).html('');
    $(output).append(pageGrid.append(pageLeft, pageRight.append(blockWaitTop)));
    $.ajax({
        url: '/api/minions',
        type: 'OPTIONS'
    }).done(function(res) {
        blockWaitTop.remove();
        var infoLink = $('<a>', {
            class: 'user navItem',
            href: '/minions/' + minion,
            minion: minion,
            item_id: 'info',
            offline_only: false,
            online_only: false,
            text: 'Status',
        });
        var infoIcon = $('<img>', {
            class: 'navItemIcon salt_minionPage_infoIcon',
            minion: minion,
            src: '/resource/plugins/salt/assets/minion_info.png'
        });
        infoLink.prepend(infoIcon);
        if (activePage == "info") { infoLink.addClass('activePage'); }
        pageLeft.append(infoLink);
        $.each(res.minion_modules, function(i, mod) {
            if (typeof mod.require_grains != "undefined") {
                var skip_mod = false;
                $.each(mod.require_grains, function(grainName, grainVal) {
                    if (typeof grains[grainName] == "undefined") {
                        skip_mod = true;
                    } else {
                        if (Array.isArray(grainVal)) {
                            var is_match = false;
                            $.each(grainVal, function(i, grainValItem) {
                                if (grains[grainName] == grainValItem) {
                                    is_match = true;
                                }
                            });
                            if (is_match === false) {
                                skip_mod = true;
                            }
                        } else {
                            if (grains[grainName] != grainVal) {
                                skip_mod = true;
                            }
                        }
                        console.log('fartyfart', skip_mod, mod);
                    }
                });
                if (skip_mod === true) { return; }
            }
            if (typeof mod.require_kernel != "undefined") {
                if (grains.kernel != mod.require_kernel) { return; }
            }
            if (typeof mod.skip_kernels != "undefined" && mod.skip_kernels.includes(grains.kernel)) { return; }
            var modLink = $('<a>', {
                class: 'user navItem salt_minionModPageLink',
                href: '/minions/' + minion + '/' + mod.href,
                minion: minion,
                item_id: mod.href,
                offline_only: mod.offline_only,
                online_only: mod.online_only,
                text: mod.label
            });
            var modIcon = $('<img>', {
                class: 'navItemIcon',
                src: mod.icon
            });
            modLink.prepend(modIcon);
            if (activePage == "info" || mod.offline_only === true) {
                modLink.css('display', 'none');
            }
            if (activePage == mod.href) { modLink.addClass('activePage'); }
            pageLeft.append(modLink);
        });
        if (activePage == "info") {
            var statList = $('<ul>', {
                class: 'objectList objectFormInputList'
            });
            pageRight.append(statList);
            var statusLine = $('<div>', {
                class: 'salt_sectionTitle'
            });
            var statusWait = $('<div>', {
                class: 'loading_place',
                css: {
                    'margin-top': 0
                }
            });
            var statusReturn = $('<div>', {
                css: {
                    'text-align': 'center',
                    'width': '100%',
                    'font-size': '16pt'
                }
            });
            statusLine.append(statusWait, statusReturn);
            statList.append(statusLine);    
            $.each(res.status_items, function(i, stat) {
                var statLine = $('<li>', {
                    class: 'objectItem formInputListItem salt_minionInfoBlock',
                    minion: minion,
                    stat: stat.label
                });
                var statLabel = $('<span>', {
                    class: 'salt_statLabel',
                    text: stat.label
                });
                var statVal = $('<span>', {
                    class: 'salt_statValue'
                });
                if (stat.list === true) {
                    var statItems = $('<ul>', {
                        css: {
                            'list-style-type': 'none',
                            'padding': '0',
                            'user-select': 'text'
                        }
                    });
                    $.each(stat.grains, function(i, grain) {
                        $.each(grains[grain], function(i, statItem) {
                            statItems.append('<li>' + statItem + '</li>');
                        });
                    });
                    statVal.html(statItems);
                } else {
                    var statText = "";
                    if (typeof stat.math != "undefined") {
                        var statText = Math.round(grains[0] + stat.math);
                        statVal.text(statText);
                    } else {
                        $.each(stat.grains, function(i, grain) {
                            if (typeof grains[grain] != "undefined") {
                                statText += grains[grain] + " "
                            }
                        });
                    }
                    if (typeof stat.append != "undefined") {
                        statText += stat.append;
                    }
                    statVal.text(statText);
                }
                statLine.append(statLabel, statVal);
                statList.append(statLine);
            });
            pingMinion(minion)
            .then(() => {
                statusReturn.text(minion);
                statusReturn.append($('<div>', {
                    class: 'salt_sectionSubTitle',
                    text: 'ONLINE'
                }));
                grains.__CONSOLE_ONLINE_NOW = true;
                grainStore(minion, grains);
                statusWait.remove();
                infoIcon.attr({'src': '/resource/plugins/salt/assets/minion_connected.png'});
                $('#salt_minionModulesGrid').css('display', '');
                salt_setMinionModOptionDisplay(minion, true);
            })
            .catch(() => {
                statusReturn.text(minion);
                statusReturn.append($('<div>', {
                    class: 'salt_sectionSubTitle',
                    text: 'OFFLINE'
                }));
                grains.__CONSOLE_ONLINE_NOW = false;
                grainStore(minion, grains);
                $('#salt_minionModulesGrid').css('display', '');
                statusWait.remove();
                infoIcon.attr({'src': '/resource/plugins/salt/assets/minion_disconnected.png'});
                console.log(minion + ' is offline.');
                salt_setMinionModOptionDisplay(minion, false);
            });
        } else {
            salt_loadMinionModule(minion, activePage);
            if (typeof grains.__CONSOLE_ONLINE_NOW == "undefined") {
                salt_showMinionModOptions(minion);
            } else {
                salt_setMinionModOptionDisplay(minion, grains.__CONSOLE_ONLINE_NOW);
            }
        }
    });
}

function salt_showMinionModOptions(minion) {
    var grains = grainStore(minion);
    pingMinion(minion)
    .then(() => {
        salt_setMinionModOptionDisplay(minion, true);
        grains.__CONSOLE_ONLINE_NOW = true;
        grainStore(minion, grains);
    })
    .catch(() => {
        salt_setMinionModOptionDisplay(minion, false);
        grains.__CONSOLE_ONLINE_NOW = false;
        grainStore(minion, grains);
    })
}

function salt_setMinionModOptionDisplay(minion, state) {
    var infoIcon = $('.salt_minionPage_infoIcon[minion="'+$.escapeSelector(minion)+'"]');
    if (state === true) {
        infoIcon.attr({'src': '/resource/plugins/salt/assets/minion_connected.png'});
        $('.salt_minionModPageLink[minion="'+$.escapeSelector(minion)+'"][offline_only="true"]').hide(0);
        $('.salt_minionModPageLink[minion="'+$.escapeSelector(minion)+'"][online_only="true"]').show(0);
    } else {
        infoIcon.attr({'src': '/resource/plugins/salt/assets/minion_disconnected.png'});
        $('.salt_minionModPageLink[minion="'+$.escapeSelector(minion)+'"][offline_only="true"]').show(0);
        $('.salt_minionModPageLink[minion="'+$.escapeSelector(minion)+'"][online_only="true"]').hide(0);
    }
}

function salt_loadMinionModule(minion, mod, output = '#minionModuleContent') {
    var header = $('#salt_minionPageHeader');
    var breadcrumb = $('<span>', { text: ' › ' });
    var homeLink = $('<a>', {
        href: '/minions',
        text: 'Minions',
    });
    var minionLink = $('<a>', {
        href: '/minions/' + minion,
        text: minion
    });
    header.html('');
    header.append(homeLink, breadcrumb, minionLink, breadcrumb.clone(), mod);
    var target = $(output);
    $.ajax({
        url: '/api/console/minion_modules/' + minion + '/' + mod,
        type: 'GET'
    }).done(function(res) {
        target.html(res.html);
        if (typeof res.js != "undefined") {
            eval(res.js);
        } else {
            salt_loadMinionModPage(minion, mod);
        }
    });
}

function pingMinion(minion) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/minions/' + minion + '/ping',
            type: 'GET'
        }).fail(function(err) {
            reject(err);
        }).done(function(res) {
            resolve(res);
        });
    });
}

function salt_sendShellCmd(minion, options) {
    var grains = grainStore(minion);
    if (localStorage.getItem(minion + '_shellHistory') === null) {
        var shellHistory = [];
    } else {
        var shellHistory = JSON.parse(atob(localStorage.getItem(minion + '_shellHistory')));
    }
    var newShellHistory = [];
    $.each(shellHistory, function(i, sh) {
        if (typeof sh.cmd != "undefined" && sh.cmd != options.cmd) {
            newShellHistory.push(sh);
        }
    });
    if (options.cmd != "") {
        newShellHistory.push({
            cmd: options.cmd,
            shell: options.shell,
            async: options.async,
            bg: options.bg,
            user: options.user
        });
    }
    localStorage.setItem(minion + '_shellHistory', btoa(JSON.stringify(newShellHistory)));
    if (options.cmd == "") {
        return false;
    }
    var buffer = $('#salt_minionShellBuffer');
    options['kernel'] = grains.kernel;
    if (options.user == "root" || options.user == "Administrator") {
        var cmdUserColor = "red";
    } else {
        var cmdUserColor = "lightblue";
    }
    var cmdLine = $('<div>', {
        class: 'salt_minionShellCmdLine',
        html:  '<span style="color: lightgreen;"><span style="color:'+cmdUserColor+';">' + options.user + '</span>@<span style="color: lightblue;">' + minion + '</span> ▶︎︎</span> <span class="salt_minionShellCmdString">' + options.cmd + '</span>'
    });
    var cmdWait = $('<div>', { class: 'loading_place no-margin' });
    buffer.append(cmdLine, cmdWait);
    setTimeout(function() {
        buffer.scrollTop(buffer[0].scrollHeight);
        salt_minionShellResetOpts(grains);
    }, 100);
    $.ajax({
        url: '/api/minions/' + minion + '/shell',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(options)
    }).fail(function(err) {
        cmdWait.replaceWith(
            $('<div>', {
                class: 'salt_minionShellResponse shellError',
                text: err.responseText
            })
        );
        setTimeout(function() {
            buffer.scrollTop(buffer[0].scrollHeight);
        }, 100);
        console.log(err);
        return false;
    }).done(function(res) {
        var response = res.response;
        var resopts = res.options;
        var resLine = $('<div>', {
            class: 'salt_minionShellResponse',
            html: response[minion]
        });
        if (resopts.async === true) {
            var jidBox = $('<div>', {
                class: 'salt_checkJobStatus inline minionShell',
                html: response.jid,
                jid: response.jid
            });
            resLine.text("ASYNC >> Salt JID: ").append(jidBox);
        }
        if (resopts.bg === true) {
            resLine.append("\n\tThis is a background task.");
        }
        cmdWait.replaceWith(resLine);
        setTimeout(function() {
            buffer.scrollTop(buffer[0].scrollHeight);
        }, 100);
        return true;
    });
}

function salt_unhideWaitDiv(context) {
    $('.hide_til_load[context="'+context+'"]').show(0);
}

function salt_loadMinionTasks(minion) {
    $('.hide_til_load[context="minion_tasks"]').hide(0);
    $('#tasks_wait').show(0);
    $('.minion_tasks_list[minion="'+$.escapeSelector(minion)+'"]').html('');
    var grains = grainStore(minion);
    if (typeof $('#salt_minionTasks_userSelect').val() != "undefined") {
        var user = $('#salt_minionTasks_userSelect').val();
    } else {
        if (grains.kernel == "Windows") {
            var user = "";
        } else {
            var user = "root";
        }
    }
    $.ajax({
        url: '/api/minions/' + minion + '/tasks/' + user,
        type: 'GET'
    }).fail(function(err) {
        salt_unhideWaitDiv('minion_tasks');
    }).done(function(res) {
        salt_unhideWaitDiv('minion_tasks');
        $('#tasks_wait').hide(0);
        $('.salt_minionTasks_newTask[minion="'+minion+'"]').attr('user', user);
        $.each(res, function(group, list) {
            if (grains.kernel == "Windows") {
                console.log(group, list);
                var item = $('<li>', {
                    class: 'objectItem',
                });
                var icon = $('<img>', {
                    class: 'objectItemIcon',
                    src: '/resource/plugins/salt/assets/minion_task.png'
                });
                var label = $('<label>', {
                    class: 'objectItemLabel actionTrigger',
                    action_class: '.salt_minionTasks_taskAction',
                    minion: minion,
                    item_id: btoa(list),
                    text: list
                });
                var action = $('<div>', {
                    class: 'objectAction salt_minionTasks_taskAction',
                    item_id: btoa(list)
                });
                item.append(icon, label, action);
                $('#minion_tasks_list_all').append(item);
            } else {
                var taskList = $('#minion_tasks_list_' + group);
                $.each(list, function(i, task) {
                    if (group == "env") {
                        task['identifier'] = task.name;
                    }
                    var item = $('<li>', {
                        class: 'objectItem',
                        item_id: task.identifier
                    });
                    var icon = $('<img>', {
                        class: 'objectItemIcon',
                        src: '/resource/plugins/salt/assets/minion_task.png'
                    });
                    var label = $('<label>', {
                        class: 'objectItemLabel actionTrigger',
                        action_class: '.salt_minionTasks_taskAction',
                        minion: minion,
                        item_id: task.identifier,
                        text: task.comment
                    });
                    if (group == "env") { label.text(task.name + ' = ' + task.value); }
                    if (group == "special") { label.text(task.comment + ' ' + task.spec); }
                    if (group == "pre") {
                        if (task == "") {
                            label.text('-- blank line --').addClass('salt_minionTasks_preItem');
                        } else {
                            label.text(task).addClass('salt_minionTasks_preItem');
                        }
                    }
                    var action = $('<div>', {
                        class: 'objectAction salt_minionTasks_taskAction',
                        item_id: task.identifier
                    });
                    var taskForm = new CronTaskForm({
                        user: user,
                        minion: minion,
                        task: task,
                        group: group
                    });
                    item.append(icon, label, action);
                    taskList.append(item);
                    action.append(taskForm.form);
                    var taskSave = $('<div>', {
                        class: 'adminNewObjectToolbar align-right no-flex-grow'
                    });
                    var taskSubmit = $('<button>', {
                        class: 'salt_minionTasks_submit',
                        minion: minion,
                        item_id: task.identifier,
                        user: user,
                        group: group,
                        text: 'Update'
                    });
                    var taskDelete = $('<button>', {
                        class: 'salt_minionTasks_delete',
                        minion: minion,
                        user: user,
                        group: group,
                        item_id: task.identifier,
                        text: 'DELETE'
                    });
                    taskDelete.prepend($('<img>', {
                        class: 'buttonIcon',
                        src: '/resource/delete_bin.png'
                    }));
                    taskSubmit.prepend($('<img>', {
                        class: 'buttonIcon',
                        src: '/resource/green_check.png'
                    }));
                    taskSave.append(taskDelete, taskSubmit);
                    action.append(taskSave);
                });
            }
        });
    });
}

function salt_loadMinionModPage(minion, context) {
    var grains = grainStore(minion);
    switch (context) {
        case "tasks":
            $.ajax({
                url: '/api/minions/' + minion + '/users',
                type: 'GET'
            }).done(function(res) {
                $.each(res, function(i, user) {
                    if (grains.kernel == "Windows") {
                        var uname = user.split(':')[1];
                        var uid = user.split(':')[0]
                    } else {
                        var uname = user;
                        var uid = user;
                    }
                    var uopt = $('<option>', {
                        value: uid,
                        text: uname
                    });
                    if ((grains.kernel == "Windows" && uname == "Administrator") || (grains.kernel != "Windows" && uname == "root")) {
                        uopt.attr('selected', 'selected');
                    }
                    $('#salt_minionTasks_userSelect').append(uopt);
                });
                $('#tasks_wait').hide(0);
                salt_unhideWaitDiv('minion_tasks_user');
                salt_loadMinionTasks(minion);
            });
            break;
        case "updates":
            $('#salt_minionUpdate_selected').hide(0);
            $.ajax({
                url: '/api/minions/' + minion + '/updates',
                type: 'GET'
            }).done(function(res) {
                let updateCount = 0;
                switch (grains.kernel) {
                    case "Windows":
                        $.each(res, function(uuid, pkgdata) {
                            updateCount++;
                            var pkgItem = $('<li>', {
                                class: 'objectItem salt_minionUpdate_pkg',
                                item_id: uuid
                            });
                            var pkgCheck = $('<input>', {
                                type: 'checkbox',
                                class: 'salt_minionUpdatesPkg',
                                item_id: uuid,
                                id: minion + '_update_' + uuid,
                                minion: minion
                            });
                            var pkgIcon = $('<img>', {
                                class: 'objectItemIcon',
                                src: '/resource/plugins/salt/assets/package.png'
                            });
                            var pkgLabel = $('<label>', {
                                class: 'objectItemLabel',
                                item_id: uuid,
                                text: pkgdata.Title,
                                for: pkgCheck.attr('id')
                            });
                            var pkgStats = $('<div>', {
                                class: 'objectItemTools',
                                item_id: uuid
                            });
                            var pkgTag = $('<div>', {
                                class: 'objectItemTag',
                                text: pkgdata.Description
                            });
                            pkgItem.append(pkgCheck, pkgIcon, pkgLabel.append(pkgTag), pkgStats);
                            $('#minion_update_list').append(pkgItem);
                        });
                        break;
                    case "Darwin":
                        break;
                    case "Linux":
                    default:
                        $.each(res, function(pkgname, pkgver) {
                            updateCount++;
                            var pkgItem = $('<li>', {
                                class: 'objectItem salt_minionUpdate_pkg',
                                item_id: pkgname
                            });
                            var pkgCheck = $('<input>', {
                                type: 'checkbox',
                                class: 'salt_minionUpdatesPkg',
                                item_id: pkgname,
                                id: minion + '_updates_' + pkgname,
                                minion: minion
                            });
                            var pkgIcon = $('<img>', {
                                class: 'objectItemIcon',
                                src: '/resource/plugins/salt/assets/package.png'
                            });
                            var pkgLabel = $('<label>', {
                                class: 'objectItemLabel',
                                item_id: pkgname,
                                pkg_ver: pkgver,
                                text: pkgname,
                                for: pkgCheck.attr('id')
                            });
                            var pkgStats = $('<div>', {
                                class: 'objectItemTools',
                                item_id: pkgname
                            });
                            var pkgTag = $('<div>', {
                                class: 'objectItemTag',
                                text: pkgver
                            });
                            pkgItem.append(pkgCheck, pkgIcon, pkgLabel.append(pkgTag), pkgStats);
                            $('#minion_update_list').append(pkgItem);
                        });
                }
                $('#update_wait').hide(0);
                if (updateCount > 0) {
                    salt_unhideWaitDiv('minion_update_list');
                } else {
                    var notice = $('<div>', {
                        class: 'salt_infoNotice',
                        text: 'This minion has no updates available to install.'
                    });
                    $('#salt_minionUpdateContent').append(notice);
                }
            });
            break;
        case "services":
            if (grains.kernel == "Windows") {
                var svcQuery = "service.get_service_name";
                var svcStatQ = {
                    client: 'local',
                    tgt: minion,
                    tgt_type: 'glob',
                    fun: 'service.status',
                    kwarg: {
                        name: '*'
                    }
                };
            } else {
                var svcQuery = "service.get_all";
                var svcStatQ = {
                    client: 'local',
                    tgt: minion,
                    tgt_type: 'glob',
                    fun: 'service.get_running'
                };
            }
            saltCall({
                client: 'local',
                tgt: minion,
                tgt_type: 'glob',
                fun: svcQuery
            }).done(function(res) {
                saltCall(svcStatQ).fail(() => {
                    console.log('an oops happened');
                    return false;
                }).done(function(chk_res) {
                    $('#svc_wait').remove();
                    $.each(res[minion], function(i, svc) {
                        if (grains.kernel == "Windows") {
                            var svcName = i;
                            var svcId = svc;
                        } else {
                            var svcName = svc;
                            var svcId = svc;
                        }
                        var svcItem = $('<li>', {
                            class: 'objectItem',
                            item_id: svcId
                        });
                        var svcIcon = $('<img>', {
                            class: 'objectItemIcon salt_minionServiceStatusIcon',
                            item_id: svcId,
                            src: '/resource/plugins/salt/assets/svc_gear_white.png'
                        });
                        if (grains.kernel == "Windows") {
                            if (chk_res[minion][svcId] === true) {
                                svcIcon.attr('src', '/resource/plugins/salt/assets/play_white.png');
                                svcIcon.css('background', 'green');
                            } else {
                                svcIcon.attr('src', '/resource/plugins/salt/assets/stop_white.png');
                                svcIcon.css('background', 'darkred');
                            }
                        } else {
                            if (chk_res[minion].includes(svcId)) {
                                svcIcon.attr('src', '/resource/plugins/salt/assets/play_white.png');
                                svcIcon.css('background', 'green');
                            } else {
                                svcIcon.attr('src', '/resource/plugins/salt/assets/stop_white.png');
                                svcIcon.css('background', 'darkred');
                            }
                        }
                        var svcLabel = $('<label>', {
                            class: 'objectItemLabel salt_minionServiceLabel actionTrigger',
                            item_id: svcId,
                            action_class: '.salt_minionServiceAction',
                            text: svcName
                        });
                        var svcTags = $('<div>', {
                            class: 'objectItemTools',
                            minion: minion,
                            item_id: svcId
                        });
                        var svcAction = $('<div>', {
                            class: 'objectAction salt_minionServiceAction',
                            item_id: svcId
                        });
                        svcItem.append(svcIcon, svcLabel, svcTags, svcAction);
                        var svcTools = $('<div>', {
                            class: 'adminNewObjectToolbar align-left'
                        });
                        var svcStart = $('<img>', {
                            class: 'objectItemToolsCommand salt_minionServiceCommand',
                            src: '/resource/plugins/salt/assets/svc_start.png',
                            cmd: 'start',
                            title: 'Start',
                            item_id: svcId,
                            minion: minion
                        });
                        var svcStop = $('<img>', {
                            class: 'objectItemToolsCommand salt_minionServiceCommand',
                            src: '/resource/plugins/salt/assets/svc_stop.png',
                            cmd: 'Stop',
                            title: 'stop',
                            item_id: svcId,
                            minion: minion
                        });
                        var svcRestart = $('<img>', {
                            class: 'objectItemToolsCommand salt_minionServiceCommand',
                            src: '/resource/plugins/salt/assets/svc_restart.png',
                            cmd: 'restart',
                            title: 'Restart',
                            item_id: svcId,
                            minion: minion
                        });
                        var svcDisable = $('<img>', {
                            class: 'objectItemToolsCommand salt_minionServiceCommand',
                            src: '/resource/plugins/salt/assets/svc_disable.png',
                            cmd: 'disable',
                            title: 'Disable',
                            item_id: svcId,
                            minion: minion
                        });
                        var svcEnable = $('<img>', {
                            class: 'objectItemToolsCommand salt_minionServiceCommand',
                            src: '/resource/plugins/salt/assets/svc_enable.png',
                            cmd: 'enable',
                            title: 'Enable',
                            item_id: svcId,
                            minion: minion
                        });
                        svcTags.append(svcStart, svcStop, svcRestart, svcDisable, svcEnable);
                        svcAction.append(svcTools);
                        var svcContent = $('<div>', {
                            class: 'salt_minionServiceContent',
                            item_id: svcId,
                            minion: minion
                        });
                        $('#salt_minionItemList').append(svcItem);
                    });
                })
            });
            break;
        case "shell":
            var buffer = $('#salt_minionShellBuffer');
            $.ajax({
                url: '/api/minions/' + minion + '/shell',
                type: 'OPTIONS'
            }).done(function(res) {
                buffer.html(res.buffer_text);
                $.each(res.quick_commands, function(i, qc) {
                    if (typeof qc.exclude_kernels != "undefined") {
                        if (qc.exclude_kernels.includes(grains.kernel)) { return; }
                    }
                    var qcOpt = $('<option>', {
                        value: qc.cmd,
                        text: qc.label,
                        'shell-bg': qc.bg,
                        'shell-async': qc.async,
                        'shell-user': qc.user
                    });
                    $('#salt_minionShellQC').append(qcOpt);
                });
                if (grains.kernel == "Windows") {
                    $('#salt_minionShellUser').css({
                        'display': 'none'
                    });
                    $('#salt_minionShellUser').val('Administrator');
                    var shellList = ['powershell', 'cmd'];
                } else {
                    var shellList = ['/bin/bash', '/usr/bin/fish', '/bin/sh', '/bin/ksh', '/bin/zsh']
                }
                $.each(shellList, function(i, shell) {
                    var shellOpt = $('<option>', {
                        value: shell,
                        text: shell
                    });
                    if (shell == "powershell" || shell == "/bin/bash") {
                        shellOpt.attr('selected', 'selected');
                    }
                    $('#salt_minionShellShell').append(shellOpt);
                });
            });
            break;
        case "users":
        case "groups":
            $.ajax({
                url: '/api/minions/' + minion + '/' + context,
                type: 'GET'
            }).done(function(res) {
                $.each(res, function(i, item) {
                    if (grains.kernel == "Windows" && context == "groups") {
                        var itemName = item.split(':')[1];
                        var itemId = item.split(':')[1];
                        var itemIdKey = item.split(':')[0];
                    } else {
                        var itemName = item;
                        var itemId = item;
                    }
                    var uList = $('#salt_minionItemList');
                    var uLine = $('<li>', {
                        class: 'objectItem',
                        minion: minion,
                        item_id: itemId,
                        context: context
                    });
                    var uIcon = $('<img>', {
                        class: 'objectItemIcon',
                        src: '/resource/' + context + '.png'
                    });
                    var uLabel = $('<label>', {
                        class: 'objectItemLabel salt_minionItemListLabel actionTrigger disableDefaultAction',
                        minion: minion,
                        item_id: itemId,
                        text: itemName,
                        context: context,
                        action_class: '.salt_minionItemListAction',
                        item_key: itemIdKey
                    });
                    var uCommands = $('<div>', {
                        class: 'objectItemTools'
                    });
                    var addDelete = true;
                    if (context == "users") {
                        if (grains.kernel == "Windows") {
                            switch (itemName.toLowerCase()) {
                                case "administrator":
                                case "system":
                                    addDelete = false;
                                    uLabel.css({
                                        background: '#cc0000',
                                        color: 'white'
                                    });
                            }
                        } else {
                            switch (itemName.toLowerCase()) {
                                case "root":
                                    addDelete = false;
                                    uLabel.css({
                                        background: '#cc0000',
                                        color: 'white'
                                    });
                            }
                        }
                    }
                    if (context == "groups") {
                        if (grains.kernel == "Windows") {
                            switch (itemName) {
                                case "Administrators":
                                case "Power Users":
                                    addDelete = false;
                                    uLabel.css({
                                        background: '#cc0000',
                                        color: 'white'
                                    });
                                    break;
                            }
                        } else {
                            switch (itemName) {
                                case "root":
                                    addDelete = false;
                                    uLabel.css({
                                        background: '#cc0000',
                                        color: 'white'
                                    });
                                    break;
                            }
                        }
                    }
                    if (addDelete === true) {
                        var uDelete = $('<img>', {
                            class: 'salt_minionItemListCommand objectItemToolsCommand disableDefaultAction',
                            command: 'DELETE',
                            minion: minion,
                            context: context,
                            item_id: itemId,
                            src: '/resource/delete_bin.png'
                        });
                        uCommands.append(uDelete);
                    }
                    var uAction = $('<div>', {
                        class: 'objectAction salt_minionItemListAction',
                        context: context,
                        item_id: itemId
                    });
                    uLine.append(uIcon, uLabel, uCommands, uAction);
                    uList.append(uLine);
                });
                $('#loadWait').remove();
            });
            break;
    }
}

function salt_toggleMinionListMulti(state = null) {
    var left = $('#salt_minionList_blockLeft');
    var right = $('#salt_minionList_blockRight');
    if (state == "hide") {
        right.hide('fast');
        //left.css({'width': '100%'});
    } else if (state == "show") {
        right.show('fast');
        //left.css({'width': '70%'});
    } else {
        if (right.is(':visible')) {
            right.hide('fast');
            //left.css({'width': '100%'});
        } else {
            right.show('fast');
            //left.css({'width': '70%'});
        }
    }
}

function listMinionsMain() {
    var contentDiv = $('#salt_minionListMain');
    var minionListTop = $('<div>', {
        class: 'salt_pageBlock'
    });
    var minionListLeft = $('<div>', {
        class: 'salt_pageBlockItem two-thirds adminContentCatch headerOnPage',
        id: 'salt_minionList_blockLeft'
    });
    var minionListRight = $('<div>', {
        class: 'salt_pageBlockItem one-third',
        id: 'salt_minionList_blockRight'
    });
    contentDiv.html('');
    contentDiv.append(minionListTop.append(minionListRight, minionListLeft));
    var minionNotices = $('<div>',{class:'adminNewObjectToolbar',id:'salt_minionListNotices'});
    var minionTools = $('<div>', {
        class: 'adminNewObjectToolbar'
    });
    var minionFilter = $('<input>', {
        class: 'objectListFilter',
        type: 'text',
        list_id: 'salt_minionList',
        placeholder: 'Filter',
        css: {
            'vertical-align': 'middle'
        }
    });
    var minionSelectAll = $('<label>', {
        text: 'Select All Visible'
    });
    var minionSelectAllCheck = $('<input>', {
        type: 'checkbox',
        id: 'salt_minionList_selectAll'
    });
    minionSelectAll.prepend(minionSelectAllCheck);
    var minion_list = $('<ul>', {
        class: 'objectList flexGrid whole condensed',
        id: 'salt_minionList'
    });
    var minion_multi = $('<div>', {
        id: 'salt_minionListActions'
    });
    var minion_multiForm = $('<ul>', {
        id: 'salt_minionMultiForm',
        class: 'objectList formInputList'
    });
    minion_multi.html(minion_multiForm);
    var minion_listWait = $('<div>', {class: 'loading_place'});
    minionListLeft.append(minionNotices, minionTools.append(minionFilter, minionSelectAll), minion_listWait, minion_list);
    minionListRight.append($('<h3>', {class: 'salt_sectionTitle', text: 'Multi Commands'}), minion_multi);
    let all_minions = [];
    $.ajax({
        url: '/api/minions',
        type: 'GET',
        headers: {
            'accept': 'application/json'
        }
    }).fail(function(err) {
        console.log(err);
    }).done(function(res) {
        minion_listWait.remove();
        reloadMinionMultiForm();
        $.each(res, function(minionName, minionGrains) {
            if (typeof minionGrains.virtual == "undefined") { return; }
            grainStore(minionName, minionGrains);
            all_minions.push(minionName);
            var minion_item = $('<li>', {
                class: 'objectItem salt_minionItem',
                //graindata: grainData
            });
            var minion_check = $('<input>', {
                type: 'checkbox',
                class: 'salt_minionList_minionCheck',
                item_id: minionName,
                css: {'vertical-align': 'middle'},
                id: 'salt_minionList_minionCheck_' + minionName
            });
            var minion_label = $('<label>', {
                class: 'objectItemLabel salt_minionItemLabel',
                action_class: '.minionAction',
                item_id: minionName
            });

            var minion_label_text = $('<div>', {
                class: 'salt_minionItemLabelText',
                text: minionName
            });
            var minion_tags = $('<div>', {
                class: 'objectItemTag salt_minionItemLabelTags'
            });
            var ip_tags = $('<div>', {
                class: 'salt_objectItemTagSpanImg'
            });
            var ip_tag_icon = $('<img>', {
                src: '/resource/plugins/salt/assets/minion_hw_lan.png'
            });
            var ip_subtag = $('<div>', {
                class: 'salt_objectItemTagSpan_subTag'
            });

            // platform tags
            $.each(['manufacturer','platform','osfam','os','mem','cpu','saltversion'], (i, g) => {
                switch (g) {
                    case "saltversion":
                        var label_name = "Salt-Minion Version";
                        var label_text = minionGrains.saltversion;
                        var iconbase = "minion_salt";
                        break;
                    case "cpu":
                        var label_name = "CPU";
                        var label_text = minionGrains.cpu_model + ' (' + minionGrains.cpuarch + ')';
                        var iconbase = "minion_hw_cpu";
                        break;
                    case "mem":
                        var label_name = "RAM";
                        var label_text = minionGrains.mem_total + ' MB';
                        var iconbase = "minion_hw_ram";
                        break;
                    case "osfam":
                        var label_name = "OS Family";
                        var label_text = minionGrains.os_family;
                        var iconbase = 'minion_os_' + minionGrains.os_family.toLowerCase().replace(/ /g, '_');
                        break;
                    case "platform":
                        var label_name = "Platform";
                        var label_text = minionGrains.virtual;
                        var iconbase = 'minion_platform_' + minionGrains.virtual.toLowerCase().replace(/ /g, '_');
                        break;
                    case "os":
                        var label_name = "Operating System";
                        var label_text = minionGrains.os + ' ' + minionGrains.osrelease
                        var iconbase = 'minion_os_' + minionGrains.os.toLowerCase().replace(/ /g, '_');
                        break;
                    case "manufacturer":
                        if (typeof minionGrains.manufacturer == "undefined" || minionGrains.manufacturer === null) { return; }
                        var label_name = "Manufacturer";
                        var label_text = minionGrains.manufacturer;
                        var m_reg = new RegExp('[^A-Za-z0-9\s]', 'g');
                        var mfg = minionGrains.manufacturer.replace(m_reg, '').replace(/ /g, '').toLowerCase();
                        if (mfg == "smbiosfailedtoloadsmbiosnosuchfileordirectory") {
                            label_text = "Solaris (detection not possible)";
                        }
                        var iconbase = 'minion_icons_' + mfg
                        break;
                }
                var tag = $('<div>', {
                    class: 'salt_objectItemTagSpanImg'
                });
                var icon = $('<img>', {
                    src: '/resource/plugins/salt/assets/' + iconbase + '.png',
                });
                var subtag = $('<div>', {
                    class: 'salt_objectItemTagSpan_subTag'
                });
                var label = $('<span>', {
                    class: 'salt_objectItemTagSpan_subTagItem',
                    html: '<div class="salt_subTagLabel">' + label_name + ':</div><div class="salt_subTagValue" v-clipboard="'+label_text+'">' + label_text + '</div>'
                });
                tag.append(icon, subtag.append(label));
                minion_tags.append(tag);
            });

            ip_tags.append(ip_tag_icon, ip_subtag);
            minion_tags.append(ip_tags);
            $.each(minionGrains.ip_interfaces, function(int, ips) {
                if (typeof ips == "undefined" || ips === null || ips.length == 0) {
                    return;
                } else if (/^ham[0-9].*$/.test(int)) {
                    return;
                } else if (/^tun[0-9].*$/.test(int)) {
                    return;
                } else if (ips[0] == "127.0.0.1") {
                    return;
                }
                var ipTag = $('<span>', {
                    class: 'salt_objectItemTagSpan_subTagItem',
                });
                var subTagLabel = $('<div>', {
                    class: 'salt_subTagLabel',
                    text: int + ':'
                });
                ipTag.append(subTagLabel);
                $.each(ips, (i, addr) => {
                    var subTagValue = $('<div>', {
                        class: 'salt_subTagValue',
                        text: addr
                    });
                    ipTag.append(subTagValue);
                });
                ip_subtag.append(ipTag);
            });
            minion_label.append(minion_label_text);
            var minion_icons = $('<div>', {
                class: 'objectItemTools salt_minionStatusIcon',
                minion: minionName
            });
            minion_list.append(minion_item.append(minion_check, minion_label.append(minion_tags), minion_icons));
        });
        $('.salt_minionStatusIcon').append(
            $('<div>', {
                class: 'loading_place no-margin smaller',
            })
        );
        var checkPki = saltCall({
            client: 'wheel',
            fun: 'key.list_all'
        }).fail((err) => {
            console.log('failed to list keys');
        }).done((res) => {
            var notices = $('#salt_minionListNotices');
            var acc_ct = res.data.return.minions.length;
            var pre_ct = res.data.return.minions_pre.length;
            if (pre_ct > 0) {
                if (pre_ct == 1) {
                    ctword = ['is', 'key', 'it'];
                } else {
                    ctword = ['are', 'keys', 'them'];
                }
                var pending_notice = $('<div>', {
                    class: 'salt_minionNotice',
                    html: 'There ' + ctword[0] + ' ' + pre_ct + ' minion ' + ctword[1] + ' pending approval. Click ' + ' <a href="/admin/plugin/salt/pki">here</a> ' + ' to manage ' + ctword[2] + '.'
                }).prepend($('<img>', {
                    src: '/resource/plugins/salt/assets/minion_info.png'
                }));
                notices.html(pending_notice);
            }
        });
        $.ajax({
            url: '/api/salt/run',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                client: 'local_async',
                fun: 'test.ping',
                tgt: all_minions
            })
        }).fail(function(x) {
            throw new Error(x);
            return false;
        }).done(function(x) {
            salt_jidCheckAction(x.jid, function(status, result) {
                var jid_minions = result.Minions;
                var minion_results = result.Result;
                $.each(jid_minions, function(i, m) {
                    if (typeof minion_results[m] != "undefined" && minion_results[m].return === true) {
                        var si = '/resource/plugins/salt/assets/status_green.png';
                        var sc = 'green';
                    } else {
                        var si = '/resource/plugins/salt/assets/status_red.png';
                        var sc = 'red';
                    }
                    var stat = $('.salt_minionStatusIcon[minion="'+$.escapeSelector(m)+'"]')
                    stat.text('_');
                    stat.append($('<img>', {
                        src: si
                    }));
                    stat.css({
                        'background': sc,
                        'color': sc
                    });
                });
            }, 7);
        });
    });
}
function reloadMinionMultiForm() {
    var form = $('#salt_minionMultiForm');
    form.html('');
    $.ajax({
        url: '/api/console/minion_list_multi',
        type: 'OPTIONS'
    }).done(function(opts) {
        $.each(opts, function(i, cmd) {
            var cmdItem = $('<li>', {
                class: 'objectItem formInputListItem salt_minionMultiFormCommand'
            });
            var cmdLabel = $('<div>', {
                class: 'objectItemLabel salt_minionMultiFormCommandLabel actionTrigger',
                text: cmd.label,
                action_class: '.salt_minionMultiFormCommandAction',
                item_id: cmd.name
            });
            var cmdAction = $('<div>', {
                class: 'objectAction salt_minionMultiFormCommandAction',
                item_id: cmd.name
            });
            var cmdOutput = $('<div>', {
                class: 'salt_minionMultiFormCommandOutput',
                result_name: cmd.name
            });
            form.append(cmdItem.append(cmdLabel, cmdAction));
            $.each(cmd.inputs, function(x, inp) {
                switch (inp.type) {
                    case "button":
                        var cmdButton = $('<button>', {
                            class: 'salt_minionMultiFormButtonCommand salt_minionMultiExec',
                            text: inp.label,
                            cmd_name: inp.name,
                            cmd_fun: inp.fun,
                            result_name: cmd.name
                        });
                        cmdAction.append(cmdButton);
                        break;
                    case "string":
                        var cmdInput = $('<input>', {
                            type: 'text',
                            class: 'salt_minionMultiFormStringInput',
                            placeholder: inp.label,
                            cmd_name: inp.name,
                            cmd_fun: inp.fun,
                            autocorrect: 'off',
                            autocapitalize: 'none'
                        });
                        var cmdSubmit = $('<button>', {
                            class: 'salt_minionMultiFormStringSubmit salt_minionMultiExec',
                            text: 'Submit',
                            cmd_name: inp.name,
                            cmd_fun: inp.fun,
                            kwarg_name: inp.kwarg_name,
                            result_name: cmd.name
                        });
                        cmdAction.append(cmdInput, cmdSubmit);
                        break;
                }
            });
            cmdAction.append(cmdOutput);
        });
    });
}
function buildSaltAdminPage(target, res) {
    switch (target) {
        case "pki":
        default:
            $('#saltAdminContent').html(pageHeader('Minion PKI Keys'));
            $.each(res, function(state, keys) {
                var list_title = $('<h3>', {
                    class: 'multiListTitle sectionTrigger',
                    section_class: '.saltAdminSection',
                    item_id: state,
                    text: state.charAt(0).toUpperCase() + state.slice(1) + " Keys (" + keys.length + ')'
                });
                var state_section = $('<div>', {
                    class: 'sectionAction saltAdminSection',
                    item_id: state
                });
                var key_tools = $('<div>', { class: 'adminNewObjectToolbar' });
                var key_filter = $('<input>', {
                    type: 'text',
                    class: 'objectListFilter',
                    placeholder: 'Filter...',
                    list_id: 'salt_pkiKeyList_list'
                });
                key_tools.append(key_filter);
                var key_list = $('<ul>', {
                    id: 'salt_pkiKeyList_list',
                    class: 'objectList salt_pkiKeyList',
                    state: state
                });
                $('#saltAdminContent').append(list_title, state_section.append(key_tools, key_list));
                $.each(keys, function(i, keyname) {
                    var key_item = $('<li>', {
                        class: 'objectItem salt_pkiKeyItem',
                        key_name: keyname,
                        key_state: state
                    });
                    var key_icon = $('<img>', {
                        class: 'objectItemIcon',
                        src: '/resource/plugins/salt/assets/key.png'
                    });
                    var key_label = $('<label>', {
                        class: 'objectItemLabel actionTrigger salt_pkiKeyItemLabel',
                        action_class: '.salt_pkiKeyItemAction',
                        item_id: keyname,
                        text: keyname
                    });
                    var key_tools = $('<div>', {
                        class: 'objectItemTools'
                    });
                    var key_delete = $('<img>', {
                        class: 'objectItemToolsCommand saltAdmin_deletePkiKey disableDefaultAction',
                        src: '/resource/delete_bin.png',
                        key_name: keyname,
                        key_state: state
                    });
                    key_tools.append(key_delete);
                    var key_action = $('<div>', {
                        class: 'objectAction salt_pkiKeyItemAction',
                        item_id: keyname,
                        key_state: state
                    });
                    key_list.append(key_item.append(key_icon, key_label, key_tools, key_action.append($('<div>', {class: 'loading_place no-margin'}))));
                    switch (state) {
                        case "pending":
                            var key_accept = $('<img>', {
                                class: 'objectItemToolsCommand disableDefaultAction saltAdmin_acceptPkiKey',
                                src: '/resource/green_check.png',
                                key_name: keyname
                            });
                            key_tools.prepend(key_accept);
                    }
                });
            });
    }
}

function loadSaltMinionPage(minion, options) {
    var context = options.context;
    var item = options.item;
    var grains = grainStore(minion);
    if (typeof options.outdiv != "undefined") {
        var outdiv = $(options.outdiv);
    } else {
        var outdiv = $('#salt_minionItemContent');
    }
    var itemWait = $('<div>', {class: 'loading_place'});
    outdiv.html(itemWait);
    var itemTools = $('<div>', {class: 'adminNewObjectToolbar align-left salt_sectionTools no-flex-grow'});
    var infoBtn = $('<button>', {
        class: 'salt_itemToolbarButton',
        cmd: 'info',
        item_id: item,
        context: context,
        minion: minion,
        text: 'Info'
    }).prepend($('<img>', {
        class: 'buttonIcon',
        src: '/resource/plugins/salt/assets/minion_info.png'
    }));
    itemTools.append(infoBtn);
    if (context == "users") {
        if (grains.kernel != "Windowsz") {
            var sshBtn = $('<button>', {
                class: 'salt_itemToolbarButton',
                cmd: 'ssh',
                item_id: item,
                context: context,
                minion: minion,
                text: 'SSH Auth Keys'
            }).prepend($('<img>', {
                class: 'buttonIcon',
                src: '/resource/plugins/salt/assets/user_ssh.png'
            }));
            itemTools.append(sshBtn);
        }
        var loginBtn = $('<button>', {
            class: 'salt_itemToolbarButton',
            cmd: 'login',
            item_id: item,
            context: context,
            minion: minion,
            text: 'Login'
        }).prepend($('<img>', {
            class: 'buttonIcon',
            src: '/resource/plugins/salt/assets/user_login.png'
        }));
        itemTools.append(loginBtn);
    }
    outdiv.prepend(itemTools);
    switch (context) {
        case "users":
        case "groups":
            var cmd = options.cmd;
            var item = options.item;
            switch (cmd) {
                case "login":
                    var usertools = $('<div>', {
                        class: 'adminNewObjectToolbar no-flex-grow centered'
                    });
                    var userLock = $('<button>', {
                        class: 'salt_minionUserLock',
                        user: item,
                        minion: minion,
                        text: "Lock Account"
                    });
                    var userUnlock = $('<button>', {
                        class: 'salt_minionUserLock',
                        user: item,
                        minion: minion,
                        text: "Unlock Account"
                    });
                    usertools.append(userLock, userUnlock);

                    var userOptsList = $('<ul>', {
                        class: 'objectList formInputList'
                    });
                    var userPwLine = $('<li>', {
                        class: 'objectItem formInputListItem'
                    });
                    var userPwLabel = $('<label>', {
                        class: 'objectItemLabel standardWidth',
                        text: 'New Password'
                    });
                    var userPwInput = $('<input>', {
                        type: 'password',
                        placeholder: 'New Password',
                        minion: minion,
                        field: 'password',
                        user: item,
                    });
                    var userPwVerifyLine = $('<li>', {
                        class: 'objectItem formInputListItem'
                    });
                    var userPwVerifyLabel = $('<label>', {
                        class: 'objectItemLabel standardWidth',
                        text: 'Verify New Password'
                    });
                    var userPwVerify = $('<input>', {
                        type: 'password',
                        placeholder: 'Verify New Password',
                        minion: minion,
                        field: 'password_verify',
                        user: item
                    });
                    var userPwSubmitLine = $('<li>', {
                        class: 'objectItem formInputListItem'
                    });
                    var userPwSubmitTools = $('<div>', {
                        class: 'adminNewObjectToolbar align-center no-flex-grow'
                    });
                    var userPwSubmit = $('<button>', {
                        class: 'salt_itemOptionSave',
                        item_id: item,
                        minion: minion,
                        kernel: grains.kernel,
                        context: context,
                        text: 'Submit New Password',
                        u_key: 'password'
                    });
                    userPwSubmitTools.append(userPwSubmit);
                    userPwLine.append(userPwLabel, userPwInput);
                    userPwVerifyLine.append(userPwVerifyLabel, userPwVerify);
                    userPwSubmitLine.append(userPwSubmitTools);
                    userOptsList.append(userPwLine, userPwVerifyLine, userPwSubmitLine);

                    itemWait.remove();
                    outdiv.append(usertools, userOptsList);
                    break;
                case "ssh":
                    $.ajax({
                        url: '/api/minions/' + minion + '/' + context + '/' + item + '/ssh_keys',
                        type: 'GET'
                    }).done(function(res) {
                        itemWait.remove();
                        console.log(res);
                        var keyTools = $('<div>', { class: 'adminNewObjectToolbar' });
                        var keyFilter = $('<input>', {
                            type: 'text',
                            placeholder: 'Filter',
                            class: 'objectListFilter',
                            list_id: 'salt_minionUserSshKeyList'
                        });
                        var keyAdd = $('<button>', {
                            class: 'salt_minionUserSshKeyAdd',
                            minion: minion,
                            user: item,
                            text: "Add Key"
                        });
                        keyTools.append(keyFilter, keyAdd);
                        var keyList = $('<ul>', {
                            class: 'objectList',
                            id: 'salt_minionUserSshKeyList',
                            minion: minion,
                            item_id: item,
                            context: 'ssh_keys'
                        });
                        outdiv.append(keyTools, keyList);
                        $.each(res[minion], function(pubKey, attrs) {
                            var keyItem = $('<li>', {
                                class: 'objectItem',
                                context: 'ssh_keys',
                                minion: minion,
                                item_id: item,
                                key_fp: attrs.fingerprint
                            });
                            var keyIcon = $('<img>', {
                                class: 'objectItemIcon',
                                src: '/resource/plugins/salt/assets/ssh_key.png'
                            });
                            var keyLabel = $('<label>', {
                                class: 'objectItemLabel salt_minionUserSshKeyLabel actionTrigger',
                                key_fp: attrs.fingerprint,
                                minion: minion,
                                item_id: attrs.fingerprint,
                                context: 'ssh_keys',
                                action_class: '.salt_minionUserSshKeyAction',
                                text: attrs.comment
                            });
                            if (typeof attrs.comment == "undefined" || attrs.comment == "") {
                                keyLabel.text(attrs.fingerprint);
                            }
                            var keyActions = $('<div>', {
                                class: 'objectItemTools'
                            });
                            var keyDelete = $('<img>', {
                                class: 'objectItemToolsCommand salt_deleteMinionUserSshAuthKey disableDefaultAction',
                                src: '/resource/delete_bin.png',
                                minion: minion,
                                user: item,
                                key_fp: attrs.fingerprint
                            });
                            keyActions.append(keyDelete);
                            var keyAction = $('<div>', {
                                class: 'objectAction salt_minionUserSshKeyAction',
                                item_id: attrs.fingerprint
                            });
                            var keyPre = $('<pre>', {
                                class: 'salt_preWrap',
                                text: attrs.enc + ' ' + pubKey
                            });
                            keyAction.append(keyPre);
                            keyItem.append(keyIcon, keyLabel, keyActions, keyAction);
                            keyList.append(keyItem);
                        });
                    });
                    break;
                case "info":
                    $.ajax({
                        url: '/api/minions/' + minion + '/' + context + '/' + item,
                        type: 'GET'
                    }).done(function(res) {
                        itemWait.remove();
                        var itemForm = $('<ul>', {
                            class: 'objectList formInputList'
                        });
                        outdiv.append(itemForm);
                        switch(context) {
                            case "groups":
                            case "users":
                                $.each(res, function(uKey, uVal) {
                                    switch (uKey) {
                                        case "passwd":
                                            return;
                                    }
                                    var uLine = $('<li>', {
                                        class: 'objectItem formInputListItem',
                                        minion: minion,
                                        item_id: item,
                                        u_key: uKey,
                                        context: context
                                    });
                                    var uLabel = $('<label>', {
                                        class: 'objectItemLabel standardWidth',
                                        text: uKey,
                                        for: minion + '_' + item + '_' + uKey
                                    });
                                    var uSave = $('<button>', {
                                        class: 'salt_itemOptionSave',
                                        item_id: item,
                                        minion: minion,
                                        kernel: grains.kernel,
                                        context: context,
                                        text: 'Update',
                                        u_key: uKey
                                    });
                                    uLine.append(uLabel);
                                    itemForm.append(uLine);
                                    switch (uKey) {
                                        case "members":
                                        case "groups":
                                            if (uKey == "members") {
                                                console.log(uVal);
                                                var uKeyAPI = "users";
                                            } else {
                                                var uKeyAPI = "groups";
                                            }
                                            var groupCont = $('<div>', {
                                                class: 'formInputListContainer'
                                            });
                                            var groupTool = $('<div>', {
                                                class: 'adminNewObjectToolbar'
                                            });
                                            var groupFilter = $('<input>', {
                                                type: 'text',
                                                class: 'objectListFilter allowFormInputList fullwidth',
                                                placeholder: 'Filter',
                                                list_id: 'salt_userGroupList'
                                            });
                                            var groupWait = $('<div>', {class:'loading_place no-margin'});
                                            var groupList = $('<ul>', {
                                                class: 'objectList formInputList',
                                                id: 'salt_userGroupList',
                                                minion: minion,
                                                item_id: item
                                            });
                                            $.ajax({
                                                url: '/api/minions/' + minion + '/' + uKeyAPI,
                                                type: 'GET'
                                            }).done(function(g_res) {
                                                groupWait.remove();
                                                $.each(g_res, function(i, gn) {
                                                    if (grains.kernel == "Windows" && uKey == "groups") {
                                                        gn = gn.split(':')[1];
                                                    }
                                                    var gItem = $('<li>', {
                                                        class: 'objectItem formInputListItem'
                                                    });
                                                    var gLabel = $('<label>', {
                                                        class: 'objectItemLabel',
                                                        text: gn
                                                    });
                                                    var gCheck = $('<input>', {
                                                        type: 'checkbox',
                                                        minion: minion,
                                                        item_key: uKey,
                                                        item_id: item,
                                                        group_id: gn
                                                    });
                                                    groupList.append(gItem.append(gLabel.prepend(gCheck)));
                                                    if (grains.kernel == "Windows" && uKeyAPI == "users") {
                                                        if (uVal.includes(minion + '\\' + gn)) {
                                                            gCheck.prop('checked', true);
                                                        }
                                                    } else {
                                                        if (uVal.includes(gn)) {
                                                            gCheck.prop('checked', true);
                                                        }
                                                    }
                                                });
                                            });
                                            uLine.append(groupCont.append(groupTool.append(groupFilter), groupWait, groupList), uSave);
                                            break;
                                        default:
                                            var uValInput = $('<input>', {
                                                id: minion + '_' + item + '_' + uKey,
                                                item_key: uKey,
                                                type: 'text',
                                                value: uVal,
                                                placeholder: '',
                                                minion: minion
                                            });
                                            uLine.append(uValInput, uSave);
                                            switch (uKey) {
                                                case "uid":
                                                case "gid":
                                                    if (typeof options.key != "undefined") {
                                                        uValInput.val(options.key);
                                                    }
                                                case "name":
                                                case "passwd":
                                                    uValInput.attr('disabled', 'disabled');
                                                    uSave.remove();
                                                    break;
                                            }
                                    }
                                });
                                break;
                        }
                    });
                }
            break;
    }
}

function moveCursorToEnd(el) {
    el.focus();
    var s = el.val();
    el.val('');
    el.val(s);
}

function salt_minionShellResetOpts(grains) {
    $('#salt_minionShellAsync').prop('checked', false);
    $('#salt_minionShellBg').prop('checked', false);
    $('#salt_minionShellShell').val($('#salt_minionShellShell option:eq(1)').val());
    if (grains.kernel == "Windows") {
        $('#salt_minionShellUser').val('Administrator');
    } else {
        $('#salt_minionShellUser').val('root');
    }
}

function salt_scrollShellHistory(minion, direction, histIndex) {
    var grains = grainStore(minion);
    var input = $('#salt_minionShellCmdInput');
    if (localStorage.getItem(minion + '_shellHistory') === null) {
        return false;
    }
    var shellHistory = JSON.parse(atob(localStorage.getItem(minion + '_shellHistory')));
    shellHistory.push('');
    shellHistory.reverse();
    var histCount = shellHistory.length - 1;
    if (direction == "up") {
        histIndex++;
    } else {
        histIndex--;
    }
    if (histIndex >= histCount) {
        histIndex = histCount;
    }
    if (histIndex <= 0) {
        histIndex = 0;
        salt_minionShellResetOpts(grains);
    }
    var histItem = histIndex;
    var obj = shellHistory[histItem];
    input.attr('histIndex', histItem);
    if (typeof obj.cmd == "undefined") {
        $('#salt_minionShellCmdInput').val(obj);
    } else {
        $('#salt_minionShellCmdInput').val(obj.cmd);
        if (typeof obj.async != "undefined" && obj.async === true) {
            $('#salt_minionShellAsync').prop('checked', true);
        } else {
            $('#salt_minionShellAsync').prop('checked', false);
        }
        if (typeof obj.bg != "undefined" && obj.bg === true) {
            $('#salt_minionShellBg').prop('checked', true);
        } else {
            $('#salt_minionShellBg').prop('checked', false);
        }
        if (typeof obj.shell != "undefined") {
            $('#salt_minionShellShell').val(obj.shell);
        }
        if (typeof obj.user != "undefined") {
            if (grains.kernel != "Windows") {
                $('#salt_minionShellUser').val(obj.user);
            }
        } else {
            if (grains.kernel == "Windows") {
                $('#salt_minionShellUser').val('Administrator');
            } else {
                $('#salt_minionShellUser').val('root');
            }
        }
    }
    setTimeout(function() {
        moveCursorToEnd(input);
    }, 10);
}

function salt_checkMinionListMultiState() {
    var checks = false;
    var allChecks = true;
    $.each($('.salt_minionList_minionCheck'), function() {
        if ($(this).prop('checked') === true) {
            checks = true;
        } else {
            allChecks = false;
        }
    });
    if (checks === true) {
        salt_toggleMinionListMulti('show');
    } else {
        salt_toggleMinionListMulti('hide');
    }
    $('#salt_minionList_selectAll').prop('checked', allChecks);
}

function saltCall(options) {
    return $.ajax({
        url: '/api/salt/run',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(options)
    });
}

function salt_stripTags(str) {
    if ((str===null) || str==='') {
        return false;
    } else {
        str. str.toString();
        return str.replace(/(<([^>]+)>)/ig, '');
    }
}

function salt_displaySaltResult(fun, res, res_out) {
    console.log(fun, res, res_out);
    res_out.html('');
    $.each(res, function(minion, status) {
        if (minion == "SALT JOB ID") {
            var jobIdBox = $('<div>', {
                class: 'salt_checkJobStatus',
                text: status[1],
                jid: status[1]
            });
            res_out.append(jobIdBox);
        } else {
            switch (fun) {
                case 'test.ping':
                    var minionLabel = $('<div>', {
                        class: 'salt_minionResultName',
                        text: minion
                    });
                    var minionReturn = $('<div>', {
                        class: 'salt_minionResultValue',
                        text: status[1]
                    });
                    if (status[0] === false) {
                        minionReturn.text('OFFLINE!').addClass('returnError');
                    } else {
                        if (minion != "SALT JOB ID") {
                            minionReturn.text('ONLINE')
                        }
                        minionReturn.addClass('greenText');
                    }
                    res_out.append(minionLabel, minionReturn);
                    break;            
                case 'saltutil.sync_all':
                case 'saltutil.sync_grains':
                case 'saltutil.refresh_pillar':
                    var minionLabel = $('<div>', {
                        class: 'salt_minionResultName',
                        text: minion
                    });
                    var minionReturn = $('<div>', {
                        class: 'salt_minionResultValue',
                        text: status[1]
                    });
                    if (status[0] === false) {
                        minionReturn.addClass('returnError');
                    }
                    res_out.append(minionLabel, minionReturn);
                    break;
                case 'cmd.run':
                default:
                    var rres = status[1];
                    var sres = rres.split(/\r?\n/);
                    var ores = $('<div>');
                    $.each(sres, function(ires, lres) {
                        console.log(lres);
                        var d_res = $('<div>', {
                            text: lres
                        });
                        ores.append(d_res);
                    })
                    var minionLabel = $('<div>', {
                        class: 'salt_minionResultName',
                        text: minion
                    });
                    var minionReturn = $('<div>', {
                        class: 'salt_minionResultValue shellResult',
                    });
                    minionReturn.append(ores);
                    if (status[0] === false) {
                        minionReturn.addClass('returnError');
                    }
                    res_out.append(minionLabel, minionReturn);
                    break;
            }
        }
    });
}

function salt_cancelXHRs(list) {
    $.each(list, function(i, xhr) {
        xhr.abort();
    });
}

function salt_checkJobId(jid) {
    return $.ajax({
        url: '/api/salt/jids/' + jid,
        type: 'GET'
    });
}

function salt_jidCheckAction(jid, callback, max_retries = 10) {
    let c = 0;
    var c_xhrs = [];
    var i = setInterval(() => {
        c = c + 1;
        var xhr = $.ajax({
            url: '/api/salt/jids/' + jid,
            type: 'GET'
        }).done((res) => {
            salt_cancelXHRs(c_xhrs);
            clearInterval(i);
            callback(true, res.fulldata);
        }).fail((err) => {
            if (err.status == 423) {
                if (c >= max_retries) {
                    salt_cancelXHRs(c_xhrs);
                    clearInterval(i);
                }
                callback(false, err.responseJSON[1]);
            } else {
                console.log('ERROR: jidCheckAction request terminated: ' + jid, err);
                clearInterval(i);
                salt_cancelXHRs(c_xhrs);
            }
        });
        c_xhrs.push(xhr);
    }, 1500);
}

function salt_awaitJobThenDisplay(jid, out) {
    let c = 0;
    var xhrs = [];
    var i = setInterval(() => {
        c = c + 1;
        var p = new Promise((resolve, reject) => {
            var xhr = $.ajax({
                url: '/api/salt/jids/' + jid,
                type: 'GET'
            }).done((res) => {
                salt_cancelXHRs(xhrs);
                resolve({fun: res.fun, result: res.result});
            }).fail((err) => {
                if (err.status == 423) {
                    if (c >= 10) {
                        console.log('killing interval ' + i + ' for jid ' + jid);
                        salt_cancelXHRs(xhrs);
                        var timeoutResult = {};
                        $.each(err.responseJSON[1]['Result'], (mn, mr) => {
                            timeoutResult[mn] = [mr['success'], mr['return']];
                        })
                        $.each(err.responseJSON[1]['Minions'], (i, mn) => {
                            if (typeof timeoutResult[mn] == "undefined" || timeoutResult[mn] == "") {
                                timeoutResult[mn] = [false, 'no response'];
                                timeoutResult['SALT JOB ID'] = [true, jid];
                            }
                        });
                        resolve({fun: err.responseJSON[1]['Function'], result: timeoutResult});
                        clearInterval(i);
                    }
                    var waitFun = err.responseJSON[1]['Function'];
                    var waitResult = {};
                    $.each(err.responseJSON[1]['Result'], (mn, mr) => {
                        waitResult[mn] = [mr['success'], mr['return']];
                    });
                    salt_displaySaltResult(waitFun, waitResult, out);
                    out.append('<div class="loading_place no-margin"></div>');
                    console.log('waiting for ' + jid + '... (' + c + ')');
                } else {
                    salt_cancelXHRs(xhrs);
                    reject({result: false});
                }
            });
            xhrs.push(xhr);
        }).then((ret) => {
            clearInterval(i);
            salt_cancelXHRs(xhrs);
            salt_displaySaltResult(ret.fun, ret.result, out);
        }).catch((err) => {
            clearInterval(i);
            salt_cancelXHRs(xhrs);
        });
        setTimeout(() => { var n = "n" }, 2000);
    }, 2000);
}

function salt_loadToolsPage(context) {
    $('#salt_toolsTitle').text('');
    $('#salt_toolsContent').html('');
    var out = $('#salt_toolsContent');
    $('.salt_toolsItem').removeClass('activePage');
    $('.salt_toolsItem[tool_id="'+context+'"]').addClass('activePage');
    out.html('');
    switch (context) {
        case 'ssh_key_manage':
            $('#salt_toolsTitle').text('Manage SSH Keys');
            var keyAddForm = new FormInputList({
                form_name: 'ssh_deploy_key',
                buttons: [
                    {
                        id: 'salt_toolsItem_addSshKey_submit',
                        label: 'Add Key'
                    }
                ],
                fields: [
                    {
                        name: 'add_key_tgt',
                        display: 'Targets',
                        type: 'str'
                    },
                    {
                        name: 'add_key_user',
                        display: 'Username',
                        type: 'str'
                    },
                    {
                        name: 'add_key_comment',
                        display: 'Comment',
                        type: 'str'
                    },
                    {
                        name: 'add_key_data',
                        display: 'Public Key',
                        type: 'textarea',
                        placeholder: 'ssh-rsa ...',
                    }
                ]
            });
            out.append($('<div>', {class: 'salt_sectionTitle', text: 'Deploy SSH Auth Key'}), keyAddForm.form);
            var keyRevForm = new FormInputList({
                form_name: 'ssh_revoke_key',
                buttons: [
                    {
                        id: 'salt_toolsItem_revSshKey_submit',
                        label: 'Revoke Key'
                    }
                ],
                fields: [
                    {
                        name: 'rev_key_tgt',
                        display: 'Targets',
                        type: 'str'
                    },
                    {
                        name: 'rev_key_user',
                        display: 'Username',
                        type: 'str'
                    },
                    {
                        name: 'rev_key_data',
                        display: 'Public Key',
                        type: 'textarea',
                        placeholder: 'ssh-rsa ...',
                    }
                ]
            });
            out.append($('<div>', {class: 'salt_sectionTitle', text: 'Revoke SSH Auth Key'}), keyRevForm.form);
            break;
        case 'check_job_id':
            $('#salt_toolsTitle').text('Check Recent Jobs');
            var jidForm = new FormInputList({
                form_name: 'check_salt_job',
                fields: [
                    {
                        name: 'job_list',
                        display: 'Recent Jobs',
                        type: 'option',
                        option_src: '/api/salt/jids'
                    },
                    {
                        name: 'job_id',
                        display: 'Job ID',
                        type: 'str',
                        buttons: [
                            {
                                label: "Check",
                                class: "salt_toolsItem_jidCheck_submit",
                                id: "salt_toolsItem_jidCheck_submit"
                            }
                        ]
                    }
                ]
            });
            var resLine = $('<li>', {
                class: 'objectItem formInputListItem'
            });
            var jidResults = $('<div>', { id: 'salt_jidCheck_results' });
            resLine.append(jidResults);
            jidForm.form.append(resLine);
            out.append(jidForm.form);
            break;
        default:
            console.log(context);
            return false;
    }
}

function salt_loadJobBlock(jid) {
    var formContent = $('<div>');
    var displayForm = uxBlock('salt_checkJobStatus');
    var formTitle = pageHeader('Check Job Status: ' + jid);
    var checkWait = $('<div>', { class: 'loading_place' });
    displayForm.append(formTitle, formContent, checkWait);
    $('.uxBlockDialogSubmit[context="salt_checkJobStatus"]').remove();
    $('.uxBlockDialogCancel[context="salt_checkJobStatus"]').text('OK');
    salt_checkJobId(jid)
    .done((res) => {
        console.log(res);
        checkWait.remove();
        var fun = res.fun;
        var ret = res.result;
        salt_displaySaltResult(fun, ret, formContent);
    })
    .fail((err) => {
        checkWait.remove();
        var res = err.responseJSON[1];
        var fun = res.Function;
        var ret = res.Result;
        salt_displaySaltResult(fun, ret, formContent);
        formContent.prepend($('<div>STILL WAITING...</div>'));
    })
}

class CronTaskForm {
    constructor(options) {
        var formList = $('<ul>', {
            class: 'objectList formInputList',
            id: options.minion + '_newtask_form'
        });
        switch (options.kernel) {
            default:
                switch (options.group) {
                    case "env":
                        var nameLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var nameLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Variable'
                        });
                        var nameInput = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Variable Name',
                            field: 'name',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        nameLine.append(nameLabel, nameInput);
                        var valLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var valLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Value'
                        });
                        var valInput = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Variable Value',
                            field: 'value',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        valLine.append(valLabel, valInput);
                        formList.append(nameLine, valLine);
                        if (typeof options.task != "undefined") {
                            nameInput.val(options.task.name).attr({identifier: options.task.name});
                            valInput.val(options.task.value).attr({identifier: options.task.name});
                        }
                        break;
                    case "special":
                        var triggerLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var triggerLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Trigger'
                        });
                        var triggerSelect = $('<select>', {
                            class: 'salt_minionTasks_fieldInput',
                            field: 'special',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        var triggerSelectLabel = $('<option>', {
                            text: 'Select...',
                            disabled: true,
                            selected: true
                        });
                        triggerLine.append(triggerLabel, triggerSelect);
                        triggerSelect.append(triggerSelectLabel);
                        $.each(['@reboot', '@yearly', '@monthly', '@weekly', '@daily', '@hourly'], function(i, spec) {
                            var specOpt = $('<option>', {
                                value: spec,
                                text: spec
                            });
                            triggerSelect.append(specOpt);
                        });
                        formList.append(triggerLine);
                        var comLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var comLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Comment'
                        });
                        var comInput = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Comment',
                            field: 'comment',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        comLine.append(comLabel, comInput);
                        formList.append(comLine);
                        var cmdLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var cmdLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Command'
                        });
                        var cmdInput = $('<textarea>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Command',
                            field: 'cmd',
                            minion: options.minion,
                            user: options.user,
                            group: options.group,
                            attr: {
                                autocomplete: 'off',
                                autocapitalize: 'none',
                                autocorrect: 'off'
                            }
                        });
                        cmdLine.append(cmdLabel, cmdInput);
                        formList.append(cmdLine);
                        var disLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var disLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Disabled'
                        });
                        var disInput = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'checkbox',
                            field: 'commented',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        disLine.append(disLabel, disInput);
                        formList.append(disLine);
                        if (typeof options.task != "undefined") {
                            triggerSelect.val(options.task.spec).attr({identifier: options.task.identifier});
                            comInput.val(options.task.comment).attr({identifier: options.task.identifier});
                            cmdInput.val(options.task.cmd).attr({identifier: options.task.identifier});
                            disInput.prop('checked', options.task.commented).attr({identifier: options.task.identifier});
                        }
                        break;
                    case "crons":
                        var timeLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var timeTools = $('<div>', {
                            class: 'adminNewObjectToolbar'
                        });
                        timeLine.append(timeTools);
                        var minute = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Minute',
                            field: 'minute',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        var hour = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Hour',
                            field: 'hour',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        var dayweek = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Weekday',
                            field: 'dayweek',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        var daymonth = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Day of Month',
                            field: 'daymonth',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        var month = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Month',
                            field: 'month',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        timeTools.append(minute, hour, dayweek, daymonth, month);
                        formList.append(timeLine);
                        var comLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var comLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Comment'
                        });
                        var comInput = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Comment',
                            field: 'comment',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        comLine.append(comLabel, comInput);
                        formList.append(comLine);
                        var cmdLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var cmdLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Command'
                        });
                        var cmdInput = $('<textarea>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'text',
                            placeholder: 'Command',
                            field: 'cmd',
                            minion: options.minion,
                            user: options.user,
                            group: options.group,
                            attr: {
                                autocomplete: 'off',
                                autocapitalize: 'none',
                                autocorrect: 'off'
                            }
                        });
                        cmdLine.append(cmdLabel, cmdInput);
                        formList.append(cmdLine);
                        var disLine = $('<li>', {
                            class: 'objectItem formInputListItem'
                        });
                        var disLabel = $('<label>', {
                            class: 'objectItemLabel standardWidth',
                            text: 'Disabled'
                        });
                        var disInput = $('<input>', {
                            class: 'salt_minionTasks_fieldInput',
                            type: 'checkbox',
                            field: 'commented',
                            minion: options.minion,
                            user: options.user,
                            group: options.group
                        });
                        disLine.append(disLabel, disInput);
                        formList.append(disLine);
                        if (typeof options.task != "undefined") {
                            minute.val(options.task.minute).attr({identifier: options.task.identifier});
                            hour.val(options.task.hour).attr({identifier: options.task.identifier});
                            dayweek.val(options.task.dayweek).attr({identifier: options.task.identifier});
                            daymonth.val(options.task.daymonth).attr({identifier: options.task.identifier});
                            month.val(options.task.month).attr({identifier: options.task.identifier});
                            comInput.val(options.task.comment).attr({identifier: options.task.identifier});
                            cmdInput.val(options.task.cmd).attr({identifier: options.task.identifier});
                            disInput.prop('checked', options.task.commented).attr({identifier: options.task.identifier});
                        }
                }
        }
        this.form = formList;
    }
}

$(document).on('click', '#salt_toolsItem_addSshKey_submit', function() {
    var formName = $(this).attr('form_name');
    var formData = getFormInputListData(formName);
    var auth_key_data = formData.add_key_data.split(' ');
    var auth_key_enc = auth_key_data[0].split('-')[1];
    var saltCallOpts = {
        client: 'local_async',
        tgt: formData.add_key_tgt,
        tgt_type: 'compound',
        fun: 'ssh.set_auth_key',
        kwarg: {
            user: formData.add_key_user,
            key: auth_key_data[1],
            enc: auth_key_enc,
            comment: formData.add_key_comment
        }
    }
    saltCall(saltCallOpts)
    .done(function(res) {
        salt_loadJobBlock(res.jid);
        return true;
    })
    .fail(function(err) {
        return false;
    })
});
$(document).on('click', '#salt_toolsItem_revSshKey_submit', function() {
    var formName = $(this).attr('form_name');
    var formData = getFormInputListData(formName);
    var auth_key_data = formData.rev_key_data.split(' ');
    var saltCallOpts = {
        client: 'local_async',
        tgt: formData.rev_key_tgt,
        tgt_type: 'compound',
        fun: 'ssh.rm_auth_key',
        kwarg: {
            user: formData.rev_key_user,
            key: auth_key_data[1],
        }
    }
    saltCall(saltCallOpts)
    .done(function(res) {
        salt_loadJobBlock(res.jid);
        return true;
    })
    .fail(function(err) {
        return false;
    })
});

$(document).on('click', '#salt_toolsItem_jidCheck_submit', function() {
    if (typeof $('#check_salt_job_job_id').val() != "undefined" && $('#check_salt_job_job_id').val() != "") {
        var jid = $('#check_salt_job_job_id').val();
        var jidWait = $('<div>', {class: 'loading_place no-margin'});
        $('#salt_jidCheck_results').html(jidWait);
        $.ajax({
            url: '/api/salt/jids/' + jid,
            type: 'GET'
        }).done(function(res) {
            jidWait.remove();
            resJSON = JSON.stringify(res.fulldata, null, 2);
            $('#salt_jidCheck_results').text(resJSON);
        }).fail(function(err) {
            $('#salt_jidCheck_results').text(JSON.stringify(err.responseJSON, null, 2));
        });
    }
});

$(document).on('change', '.formInputListField[type="radio"][name="check_salt_job_job_list"]', function() {
    if ($(this).prop('checked') === true) {
        $('#check_salt_job_job_id').val($(this).val());
        console.log('CLICKETY!');
        $('#salt_toolsItem_jidCheck_submit').click();
    }
});

$(document).on('click', '.salt_toolsItem', function() {
    var context = $(this).attr('tool_id');
    salt_loadToolsPage(context);
});

$(document).on('click', '.salt_minionTasks_newTask', function() {
    var minion = $(this).attr('minion');
    var group = $(this).attr('task_group');
    var user = $(this).attr('user');
    var kernel = $(this).attr('kernel');
    switch (kernel) {
        case "Windows":
            alert('no.');
            return false;
        case "Linux":
        default:
            var formBase = uxBlock('minion_task_new');
            var formTitle = pageHeader('New Task: ' + user + '@' + minion + ' / ' + group).prepend($('<img>', {src:'/resource/plugins/salt/assets/minion_task_new.png'}));
            formBase.append(formTitle);
            var taskForm = new CronTaskForm({
                minion: minion,
                kernel: kernel,
                user: user,
                group: group
            });
            formBase.append(taskForm.form);
    }
    $('.uxBlockDialogSubmit[context=minion_task_new]').attr({
        minion: minion,
        group: group,
        user: user,
        kernel: kernel
    });
});
$(document).on('click', '.salt_minionTasks_submit', function() {
    var minion = $(this).attr('minion'),
        grains = grainStore(minion),
        ident = $(this).attr('item_id'),
        user = $(this).attr('user'),
        group = $(this).attr('group'),
        data = {
            kernel: grains.kernel,
            group: group,
            task: {
                user: user,
                identifier: ident
            }
        };

    $.each($('.salt_minionTasks_fieldInput[minion="'+$.escapeSelector(minion)+'"][user="'+$.escapeSelector(user)+'"][identifier="'+ident+'"]'), function() {
        var field = $(this).attr('field');
        switch ($(this).attr('type')) {
            case 'checkbox':
                var val = $(this).prop('checked');
                break;
            default:
                var val = $(this).val();
        }
        data.task[field] = val;
    });
    
    $.ajax({
        url: '/api/minions/' + minion + '/tasks',
        type: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).fail(function(err) {
        return false;
    }).done(function(res) {
        salt_loadMinionTasks(minion);
        return true;
    });
});
$(document).on('click', '.salt_minionTasks_delete', function() {
    var minion = $(this).attr('minion'),
        grains = grainStore(minion),
        ident = $(this).attr('item_id'),
        user = $(this).attr('user'),
        group = $(this).attr('group'),
        cmd = $('.salt_minionTasks_fieldInput[minion="'+$.escapeSelector(minion)+'"][identifier="'+$.escapeSelector(ident)+'"][field="cmd"]').val();
    $.ajax({
        url: '/api/minions/' + minion + '/tasks',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({
            kernel: grains.kernel,
            user: user,
            cmd: cmd,
            ident: ident,
            group: group
        })
    }).fail(function(err) {
        return false;
    }).done(function(res) {
        salt_loadMinionTasks(minion);
        return true;
    });
});
$(document).on('click', '.uxBlockDialogSubmit[context=minion_task_new]', function() {
    var minion = $(this).attr('minion'),
        group = $(this).attr('group'),
        user = $(this).attr('user'),
        kernel = $(this).attr('kernel'),
        cmdWait = $('<div>', { class: 'loading_place' }),
        data = {
            kernel: kernel,
            group: group,
            task: {
                user: user
            }
        };
    $('#' + $.escapeSelector(minion) + '_newtask_form').hide(0);
    $('.uxDialogBase').append(cmdWait);
    $.each($('.salt_minionTasks_fieldInput[group="'+group+'"][minion="'+$.escapeSelector(minion)+'"][user="'+$.escapeSelector(user)+'"]'), function() {
        var field = $(this).attr('field');
        switch ($(this).attr('type')) {
            case 'checkbox':
                data.task[field] = $(this).prop('checked');
                break;
            default:
                data.task[field] = $(this).val();
        }
    });
    $.ajax({
        url: '/api/minions/' + minion + '/tasks',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).fail(function(err) {
        cmdWait.remove();
        $('#' + $.escapeSelector(minion) + '_newtask_form').show(0);
        return false;
    }).done(function(res) {
        $('.uxBlock').remove();
        salt_loadMinionTasks(minion);
    });
});

$(document).on('click', '#salt_minionUpdate_all', function() {
    var minion = $(this).attr('minion');
    var grains = grainStore(minion);
    var pkgWait = $('<div>', { class: 'loading_place' });
    $('#minion_update_tools').append(pkgWait);
    switch (grains.kernel) {
        case "Windows":
            let pkgList = [];
            $('#minion_update_tools').append(pkgWait);
            $.each($('.salt_minionUpdatesPkg[minion="'+minion+'"]'), function() {
                var pkgItemName = $.escapeSelector($(this).attr('item_id'));
                pkgList.push(pkgItemName);
                $('.objectItemTools[item_id="'+pkgItemName+'"]').append(
                    $('<div>', {
                        class: 'loading_place no-margin smaller',
                        css: {
                            'content': ' ',
                            'width': '32px'
                        }
                    })
                );
            });
            $.ajax({
                url: '/api/minions/' + minion + '/updates',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    kernel: grains.kernel,
                    update_all: false,
                    names: pkgList
                })
            }).fail(function(err) {
                pkgWait.remove();
                return false;
            }).done(function(res) {
                pkgWait.remove();
                var jid = $('<div>', {
                    class: 'salt_checkJobStatus',
                    jid: res.jid,
                    text: 'Check Job Status ...'
                });
                $('#minion_update_tools').append(jid);
                return true;
            });
            break;
        case "Darwin":
            alert('mac os not yet supported lol');
            break;
        default:
            $.each($('li.salt_minionUpdate_pkg'), function() {
                var pkgItem = $(this);
                var pkgTools = pkgItem.find('.objectItemTools');
                var pkgWait = $('<div>', {
                    class: 'loading_place no-margin smaller',
                    css: {
                        'content': ' ',
                        'width': '32px'
                    }
                });
                pkgTools.append(pkgWait);
            });
            $.ajax({
                url: '/api/minions/' + minion + '/updates',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    kernel: grains.kernel,
                    update_all: true
                })
            }).fail(function(err) {
                pkgWait.remove();
                return false;
            }).done(function(res) {
                pkgWait.remove();
                var jid = $('<div>', {
                    class: 'salt_checkJobStatus',
                    jid: res.jid,
                    text: 'Check Job Status ...'
                });
                $('#minion_update_tools').append(jid);
                salt_jidCheckAction(res.jid, function(status, result) {
                    var minion_results = result.Result;
                    if (typeof minion_results[minion] != "undefined") {
                        var minion_success = minion_results[minion].success;
                        $.each(minion_results[minion].return, function(pkgInstName, pkgInstState) {
                            var pkgLine = $('.salt_minionUpdate_pkg[item_id="'+$.escapeSelector(pkgInstName)+'"]');
                            if (minion_success === true) {
                                pkgLine.remove();
                                pkgLine.find('.objectItemTools').html('');
                                $('.salt_checkJobStatus[jid="'+res.jid+'"]').remove();
                            }
                        });
                    }
                }, 100);
                return true;
            });
    }
});
$(document).on('click', '#salt_minionUpdate_selected', function() {
    var minion = $(this).attr('minion');
    var grains = grainStore(minion);
    let pkgList = [];
    var pkgWait = $('<div>', { class: 'loading_place' });
    $('#minion_update_tools').append(pkgWait);
    $.each($('.salt_minionUpdatesPkg[minion="'+minion+'"]'), function() {
        if ($(this).prop('checked') === true) {
            var pkgItemName = $.escapeSelector($(this).attr('item_id'));
            pkgList.push(pkgItemName);
            $('.objectItemTools[item_id="'+pkgItemName+'"]').append(
                $('<div>', {
                    class: 'loading_place no-margin smaller',
                    css: {
                        'content': ' ',
                        'width': '32px'
                    }
                })
            );
        }
    });
    $.ajax({
        url: '/api/minions/' + minion + '/updates',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            kernel: grains.kernel,
            update_all: false,
            names: pkgList
        })
    }).fail(function(err) {
        pkgWait.remove();
        return false;
    }).done(function(res) {
        pkgWait.remove();
        var jid = $('<div>', {
            class: 'salt_checkJobStatus',
            jid: res.jid,
            text: 'Check Job Status ...'
        });
        $('#minion_update_tools').append(jid);
        salt_jidCheckAction(res.jid, function(status, result) {
            var minion_results = result.Result;
            if (typeof minion_results[minion] != "undefined") {
                var minion_success = minion_results[minion].success;
                $.each(minion_results[minion].return, function(pkgInstName, pkgInstState) {
                    var pkgLine = $('.salt_minionUpdate_pkg[item_id="'+$.escapeSelector(pkgInstName)+'"]');
                    if (minion_success === true) {
                        pkgLine.remove();
                        pkgLine.find('.objectItemTools').html('');
                        $('.salt_checkJobStatus[jid="'+res.jid+'"]').remove();
                    }
                });
            }
        }, 100);
        return true;
    });
});

$(document).on('change', '#salt_minionTasks_userSelect', function() {
    var minion = $(this).attr('minion');
    salt_loadMinionTasks(minion);
});

$(document).on('change', '.salt_minionUpdatesPkg', function() {
    var minion = $(this).attr('minion');
    var grains = grainStore(minion);
    var showTools = false;
    $.each($('.salt_minionUpdatesPkg'), function() {
        if ($(this).prop('checked') === true) {
            showTools = true;
        } else {
            $('#salt_minionUpdate_selectAll').prop('checked', false);
        }
    });
    if (showTools === true) {
        $('#salt_minionUpdate_selected').show(0);
    } else {
        $('#salt_minionUpdate_selected').hide(0);
    }
});

$(document).on('change', '#salt_minionUpdate_selectAll', function() {
    var minion = $(this).attr('minion');
    var grains = grainStore(minion);
    var checkState = $(this).prop('checked');
    $.each($('.salt_minionUpdatesPkg'), function() {
        if ($(this).parent().is(':visible')) {
            $(this).prop('checked', checkState);
        }
    });
    if (checkState === true) {
        $('#salt_minionUpdate_selected').show(0);
    } else {
        $('#salt_minionUpdate_selected').hide(0);
    }
});

$(document).on('click', '.salt_checkJobStatus', function() {
    var minionShell = $(this).hasClass('minionShell');
    console.log(minionShell);
    var checkWait = $('<div>', {class: 'loading_place'});
    var jid = $(this).attr('jid');
    if (minionShell === true) {
        var parent = $(this).parent();
        parent.find('.salt_checkJobStatus_minionShell').remove();
        var formContent = $('<div>', {class: 'salt_checkJobStatus_minionShell', jid: jid});
        parent.append(formContent, checkWait);
    } else {
        var formContent = $('<div>');
        var displayForm = uxBlock('salt_checkJobStatus');
        var formTitle = pageHeader('Check Job Status: ' + jid);
        displayForm.append(formTitle, formContent, checkWait);
    }
    salt_checkJobId(jid)
        .done((res) => {
            console.log(res);
            checkWait.remove();
            var fun = res.fun;
            var ret = res.result;
            salt_displaySaltResult(fun, ret, formContent);
        })
        .fail((err) => {
            checkWait.remove();
            var res = err.responseJSON[1];
            var fun = res.Function;
            var ret = res.Result;
            salt_displaySaltResult(fun, ret, formContent);
            formContent.prepend($('<div>STILL WAITING...</div>'));
        })
});

$(document).on('click', '.salt_minionMultiExec', function() {
    var res_name = $(this).attr('result_name');
    var res_out = $('.salt_minionMultiFormCommandOutput[result_name="'+$.escapeSelector(res_name)+'"]');
    var res_wait = $('<div>', {class: 'loading_place no-margin'});
    res_out.html(res_wait);
    res_out.show('fast');
});

$(document).on('click', '.salt_minionMultiFormStringSubmit', function() {
    var cmd = $(this).attr('cmd_name');
    var fun = $(this).attr('cmd_fun');
    var arg = $('.salt_minionMultiFormStringInput[cmd_name="'+$.escapeSelector(cmd)+'"]').val();
    $('.salt_minionMultiFormStringInput[cmd_name="'+$.escapeSelector(cmd)+'"]').val('');
    var arg_name = $(this).attr('kwarg_name');
    var res_name = $(this).attr('result_name');
    var res_out = $('.salt_minionMultiFormCommandOutput[result_name="'+$.escapeSelector(res_name)+'"]');
    var tgt = [];
    $.each($('.salt_minionList_minionCheck'), function() {
        if ($(this).prop('checked') === true) {
            tgt.push($(this).attr('item_id'));
        }
    });
    var data = {
        client: 'local_async',
        tgt: tgt,
        fun: fun,
        kwarg: {}
    }
    data['kwarg'][arg_name] = arg;
    saltCall(data).done((res) => {
        salt_awaitJobThenDisplay(res.jid, res_out);
    });
});

$(document).on('click', '.salt_minionMultiFormButtonCommand', function() {
    var cmd_fun = $(this).attr('cmd_fun');
    var cmd_tgt = [];
    var res_name = $(this).attr('result_name');
    var res_out = $('.salt_minionMultiFormCommandOutput[result_name="'+$.escapeSelector(res_name)+'"]');
    $.each($('.salt_minionList_minionCheck'), function() {
        if ($(this).prop('checked') === true) {
            cmd_tgt.push($(this).attr('item_id'));
        }
    });
    var data = {
        client: 'local_async',
        tgt: cmd_tgt,
        fun: cmd_fun
    }
    saltCall(data).done((res) => {
        salt_awaitJobThenDisplay(res.jid, res_out);
    });
});

$(document).on('change', '#salt_minionList_selectAll', function() {
    if ($(this).prop('checked') === true) {
        $.each($('.salt_minionList_minionCheck'), function() {
            if ($(this).is(':visible')) {
                $(this).prop('checked', true);
            }
        });
    } else {
        $('.salt_minionList_minionCheck').prop('checked', $(this).prop('checked'));
    }
    salt_checkMinionListMultiState();
});

$(document).on('change', '.salt_minionList_minionCheck', function() {
    salt_checkMinionListMultiState();
});

$(document).on('click', '.salt_minionUserSshKeyAdd', function() {
    var user = $(this).attr('user');
    var minion = $(this).attr('minion');
    var block = uxBlock('salt_add_user_ssh_key');
    var form = $('<ul>', {
        class: 'objectList formInputList',
        id: 'salt_minionUserSshKeyAddForm'
    });
    var nameLine = $('<li>', {
        class: 'objectItem formInputListItem'
    });
    var nameLabel = $('<label>', {
        class: 'objectItemLabel standardWidth',
        text: 'Comment',
        for: 'salt_minionUserSshKeyNameInput'
    });
    var nameInput = $('<input>', {
        type: 'text',
        placeholder: 'Key Name/Comment',
        id: 'salt_minionUserSshKeyNameInput'
    });
    nameLine.append(nameLabel, nameInput);
    var keyLine = $('<li>', {
        class: 'objectItem formInputListItem'
    });
    var keyLabel = $('<label>', {
        class: 'objectItemLabel standardWidth',
        text: 'Public Key',
        for: 'salt_minionuserSshKeyAddInput'
    });
    var keyInput = $('<textarea>', {
        class: 'inputFormTextarea',
        id: 'salt_minionUserSshKeyAddInput',
        placeholder: 'ssh-rsa ...'
    });
    keyLine.append(keyLabel, keyInput);
    form.append(nameLine, keyLine);
    block.html(form);
    block.prepend(pageHeader('New SSH Auth Key: ' + user + '@' + minion));
    $('.uxBlockDialogSubmit[context=salt_add_user_ssh_key]').attr({
        user: user,
        minion: minion
    });
});

$(document).on('click', '.salt_deleteMinionUserSshAuthKey', function() {
    var user = $(this).attr('user');
    var minion = $(this).attr('minion');
    var fp = $(this).attr('key_fp');
    var keyString = $('.objectAction.salt_minionUserSshKeyAction[item_id="'+fp+'"] pre.salt_preWrap').text();
    var outdiv = $('.salt_minionItemListAction[context=users][item_id="'+$.escapeSelector(user)+'"]');
    $.ajax({
        url: '/api/minions/' + minion + '/users/' + user + '/ssh_keys/' + fp,
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({
            key: keyString
        })
    }).fail(function(err) {
        alert(err.responseText);
        return false;
    }).done(function() {
        $('.li.objectItem[context=ssh_keys][key_fp="'+fp+'"]').remove();
        loadSaltMinionPage(minion, {
            cmd: 'ssh',
            context: 'users',
            item: user,
            outdiv: outdiv
        });
    });
});

$(document).on('click', '#salt_deleteMinion', function() {
    var btn = $(this);
    var minion = btn.attr('minion');
    btn.hide(0);
    btn.parent().append($('<div>', {class: 'loading_place'}));
    $.ajax({
        url: '/api/salt/pki/' + minion,
        type: 'DELETE'
    }).done((res) => {
        window.location.href = '/minions';
        return true;
    }).fail((err) => {
        console.log(err);
        return false;
    });
});

$(document).on('click', '.uxBlockDialogSubmit[context=salt_add_user_ssh_key]', function() {
    var user = $(this).attr('user');
    var minion = $(this).attr('minion');
    var comment = $('#salt_minionUserSshKeyNameInput').val();
    var pubkey = $('#salt_minionUserSshKeyAddInput').val();
    var keyWait = $('<div>', {class: 'loading_place'});
    var form = $('#salt_minionUserSshKeyAddForm');
    var block = $('.uxBlockDialogBase');
    var outdiv = $('.salt_minionItemListAction[context=users][item_id="'+$.escapeSelector(user)+'"]');
    block.append(keyWait);
    form.hide('fast');
    $.ajax({
        url: '/api/minions/' + minion + '/users/' + user + '/ssh_keys',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            key: pubkey,
            comment: comment
        })
    }).fail(function(err) {
        alert(err.responseText);
        keyWait.remove();
        form.show('fast');
        return false;
    }).done(function(res) {
        $('.uxBlock').remove();
        loadSaltMinionPage(minion, {
            cmd: 'ssh',
            context: 'users',
            item: user,
            outdiv: outdiv
        });
    });
});

$(document).on('change', '#salt_minionShellQC', function() {
    var cmd = $(this).val();
    var selcmd = $('#salt_minionShellQC option:selected');
    if (typeof selcmd.attr('shell-user') != "undefined") {
        $('#salt_minionShellUser').val(selcmd.attr('shell-user'));
    }
    var async = $('#salt_minionShellQC option:selected').attr('shell-async');
    var bg = $('#salt_minionShellQC option:selected').attr('shell-bg');
    $('#salt_minionShellCmdInput').val(cmd);
    if (async == "true") {
        $('#salt_minionShellAsync').prop('checked', true);
    } else {
        $('#salt_minionShellAsync').prop('checked', false);
    }
    if (bg == "true") {
        $('#salt_minionShellBg').prop('checked', true);
    } else {
        $('#salt_minionShellBg').prop('checked', false);
    }
});

$(document).on('click', '#salt_minionShellCmdSubmit', function() {
    var cmd = $('#salt_minionShellCmdInput').val();
    var minion = $(this).attr('minion');
    var grains = grainStore(minion);
    $('#salt_minionShellCmdInput').val('');
    if (cmd == "clear") {
        $('#salt_minionShellBuffer').text('');
        salt_minionShellResetOpts(grains);
        return true;
    }
    var async = $('#salt_minionShellAsync').prop('checked');
    var bg = $('#salt_minionShellBg').prop('checked');
    var user = $('#salt_minionShellUser').val();
    $('#salt_minionShellCmdInput').removeAttr('histIndex');
    salt_sendShellCmd(minion, {
        cmd: cmd,
        async: async,
        bg: bg,
        user: user,
        shell: $('#salt_minionShellShell').val()
    });
});

$(document).on('keyup', '#salt_minionShellCmdInput', function(e) {
    var minion = $(this).attr('minion');
    var grains = grainStore(minion);
    switch (e.key) {
        case "Enter":
            var cmd = $(this).val();
            $(this).val('');
            if (cmd == "clear") {
                $('#salt_minionShellBuffer').text('');
                salt_minionShellResetOpts(grains);
                return true;
            }
            var async = $('#salt_minionShellAsync').prop('checked');
            var bg = $('#salt_minionShellBg').prop('checked');
            var user = $('#salt_minionShellUser').val();
            $(this).removeAttr('histIndex');
            salt_sendShellCmd(minion, {
                cmd: cmd,
                async: async,
                bg: bg,
                user: user,
                shell: $('#salt_minionShellShell').val()
            });
            break;
    }
});
$(document).on('keydown', '#salt_minionShellCmdInput', function(e) {
    var minion = $(this).attr('minion');
    if (typeof $(this).attr('histIndex') == "undefined") {
        $(this).attr('histIndex', 0);
    }
    var histIndex = Number($(this).attr('histIndex'));
    switch (e.key) {
        case "ArrowUp":
            salt_scrollShellHistory(minion, 'up', histIndex);
            break;
        case "ArrowDown":
            salt_scrollShellHistory(minion, 'down', histIndex);
            break;
    }
});

$(document).on('click', '.saltAdmin_acceptPkiKey', function() {
    var key_state = $(this).attr('key_state');
    var key = $(this).attr('key_name');
    $.ajax({
        url: '/api/salt/pki/' + key,
        type: 'UNLOCK'
    }).fail(function(err) {
        alert(err.responseText);
        return false;
    }).done(function(res) {
        alert('Key Accepted!');
        $('li.salt_pkiKeyItem[key_state="'+key_state+'"][key_name="'+$.escapeSelector(key)+'"]').remove();
        var keyItem = $('<li>', {
            class: 'objectItem salt_pkiKeyuItem',
            key_name: key,
            key_state: 'accepted'
        });
        var keyIcon = $('<img>', {
            class: 'objectItemIcon',
            src: '/resource/plugins/salt/assets/key.png'
        });
        var keyLabel = $('<label>', {
            class: 'objectItemLabel salt_pkiKeyItemLabel',
            action_class: '.salt_pkiKeyItemAction',
            item_id: key,
            text: key
        });
        var keyTools = $('<div>', {
            class: 'objectItemTools'
        });
        var keyDelete = $('<img>', {
            class: 'objectItemToolsCommand disableDefaultAction saltAdmin_deletePkiKey',
            src: '/resource/delete_bin.png',
            key_name: key,
            key_state: 'accepted'
        });
        var keyActions = $('<div>', {
            class: 'objectAction salt_pkiKeyItemAction',
            key_name: key,
            item_id: key,
            key_state: 'accepted'
        });
        keyTools.append(keyDelete);
        keyItem.append(keyIcon, keyLabel, keyTools, keyActions);
        $('ul.salt_pkiKeyList[state="'+key_state+'"]').append(keyItem);
        return true;
    });
})

$(document).on('click', '.saltAdmin_deletePkiKey', function() {
    var key = $(this).attr('key_name');
    var ok = confirm("OK to delete the key for " + key + "?");
    if (ok === true) {
        $.ajax({
            url: '/api/salt/pki/' + key,
            type: 'DELETE',
        }).fail(function(err) {
            alert(err.responseText);
            return false;
        }).done(function(res) {
            $('li.salt_pkiKeyItem[key_name="'+$.escapeSelector(key)+'"]').remove();
            alert('Key Deleted!');
            return true;
        });
    }
});

$(document).on('click', '.salt_minionItemListLabel', function() {
    var context = $(this).attr('context');
    var minion = $(this).attr('minion');
    var item = $(this).attr('item_id');
    var outdiv = '.salt_minionItemListAction[context="'+context+'"][item_id="'+$.escapeSelector(item)+'"]';
    var outvis = $(outdiv).is(':visible');
    $(outdiv).html('');
    if (outvis === false) {
        loadSaltMinionPage(minion, {
            cmd: 'info',
            context: context,
            item: item,
            outdiv: outdiv,
            key: $(this).attr('item_key')
        });
    }
    toggleAction($(this).attr('action_class'), $(this).attr('item_id'));
});

$(document).on('click', '.salt_itemToolbarButton', function() {
    var context = $(this).attr('context');
    var minion = $(this).attr('minion');
    var item = $(this).attr('item_id');
    var cmd = $(this).attr('cmd');
    var outdiv = '.salt_minionItemListAction[context="'+context+'"][item_id="'+$.escapeSelector(item)+'"]';
    loadSaltMinionPage(minion, {
        cmd: cmd,
        context: context,
        item: item,
        outdiv: outdiv
    });
});

$(document).on('click', '.salt_pkiKeyItemLabel', function() {
    var keyname = $(this).attr('item_id');
    var item_action = $('.salt_pkiKeyItemAction[item_id="'+$.escapeSelector(keyname)+'"]');
    $.ajax({
        url: '/api/admin/plugin/salt/pki/' + keyname
    }).fail(function(err) {
        console.log(err);
    }).done(function(res) {
        var keyfield = $('<pre>', {
            class: 'salt_pkiKeyItemData',
            text: res
        });
        item_action.html(keyfield);
    });
});

$(document).on('click','.loadPluginAdminPageModule[plugin_name="salt"]', function() {
    var mod = $(this).attr('module_name');
    $('#adminContent').html($('<div>', {
        class: 'adminContentCatch',
        id: 'saltAdminContent'
    }));
    $.ajax({
        url: '/api/admin/plugin/salt/' + mod,
        type: 'GET'
    }).fail(function(err) {
        return false;
    }).done(function(res) {
        buildSaltAdminPage(mod, res);
    });
});

$(document).on('click', '.salt_minionItemLabel', function() {
    var minion = $(this).attr('item_id');
    window.location.href = '/minions/' + minion;
});

$(document).on('click', '.salt_minionNewUserButton, .salt_minionNewGroupButton', function() {
    var uBlock = uxBlock('salt_minionNewAccount');
    var minion = $(this).attr('minion');
    var kernel = $(this).attr('kernel');
    var grains = grainStore(minion);
    if ($(this).hasClass('salt_minionNewUserButton')) {
        var context = "users";
        var title = pageHeader('New ' + grains.os + ' User: ' + minion);
        var passwd = true;
    } else {
        var context = "groups";
        var title = pageHeader('New ' + grains.os + ' Group: ' + minion);
        var passwd = false;
    }
    $('.uxBlockDialogSubmit').attr({
        account_context: context,
        minion: minion,
        kernel: kernel
    });
    uBlock.append(title);
    var formOptions = {
        form_name: 'salt_minionNewAccount',
        context: context,
        kernel: kernel,
        fields: [
            {
                name: "name",
                display: "Name",
                type: "str"
            }
        ]
    };
    if (passwd === true) {
        formOptions.fields.push(
            {
                name: "password",
                display: "Password",
                type: "password"
            },
            {
                name: "fullname",
                display: "Full Name",
                type: "str"
            }
        );
        switch (kernel) {
            case "Windows":
                formOptions.fields.push(
                    {
                        name: "logonscript",
                        display: "Login script",
                        type: "str"
                    },
                    {
                        name: "homedrive",
                        display: "Home Drive",
                        type: "str"
                    },
                    {
                        name: "description",
                        display: "Description",
                        type: "str"
                    }
                )
                break;
            case "Darwin":
            case "Solaris":
                formOptions.fields.push(
                    {
                        name: "shell",
                        display: "Login Shell",
                        type: "str",
                        default: "/bin/bash"
                    },
                    {
                        name: "home",
                        display: "Home Dir",
                        type: "str"
                    },
                    {
                        name: "createhome",
                        display: "Create Home",
                        type: "bool",
                        default: true
                    }
                )
                break;
            default:
                formOptions.fields.push(
                    {
                        name: "shell",
                        display: "Login Shell",
                        type: "str",
                        default: "/bin/bash"
                    },
                    {
                        name: "home",
                        display: "Home Dir",
                        type: "str"
                    },
                    {
                        name: "createhome",
                        display: "Create Home",
                        type: "bool",
                        default: true
                    },
                    {
                        name: "system",
                        display: "System User",
                        type: "bool",
                        default: false
                    }
                );
        }
    }
    var form = new FormInputList(formOptions);
    uBlock.append(form.form);
});

$(document).on('click', '.salt_itemOptionSave', function() {
    var minion = $(this).attr('minion');
    var item = $(this).attr('item_id');
    var context = $(this).attr('context');
    var key = $(this).attr('u_key');
    var thisButton = $(this);
    var ajaxOpts = {
        url: '/api/minions/' + minion + '/' + context + '/' + item + '/' + key,
        type: 'PATCH',
        contentType: 'application/json'
    }
    ajaxOptsData = {
        'kernel': $(this).attr('kernel')
    }
    switch (context) {
        case "groups":
            switch (key) {
                case "members":
                    var member_list = [];
                    $.each($('input[type="checkbox"][minion="'+$.escapeSelector(minion)+'"][item_key="'+key+'"]'), function() {
                        if ($(this).prop('checked') === true) { member_list.push($(this).attr('group_id')); }
                    });
                    //ajaxOpts['data'] = JSON.stringify(member_list);
                    ajaxOptsData.data = member_list;
                    break;
            }
            break;
        case "users":
            switch (key) {
                case "groups":
                    var group_list = [];
                    $.each($('input[type="checkbox"][minion="'+$.escapeSelector(minion)+'"][item_key="groups"]'), function() {
                        if ($(this).prop('checked') === true) { group_list.push($(this).attr('group_id')); }
                    });
                    //ajaxOpts['data'] = JSON.stringify(group_list);
                    ajaxOptsData.data = group_list;
                    break;
                default:
                    var dataValue = $('#' + $.escapeSelector(minion) + '_' + item + '_' + key).val();
                    //ajaxOpts['data'] = JSON.stringify(dataValue);
                    ajaxOptsData.data = dataValue;
            }
            break;
    }
    ajaxOpts['data'] = JSON.stringify(ajaxOptsData);
    $.ajax(ajaxOpts)
    .fail(function(err) {
        console.log(err);
        alert('error saving value');
        return false;
    })
    .done(function(res) {
        thisButton.text('Saved!');
        console.log(res);
        return true;
    });
});

$(document).on('click', '.salt_minionItemListCommand', function() {
    var command = $(this).attr('command');
    var context = $(this).attr('context');
    var minion = $(this).attr('minion');
    var item = $(this).attr('item_id');
    switch (command) {
        case "DELETE":
            switch (context) {
                case "users":
                case "groups":
                    $.ajax({
                        url: '/api/minions/' + minion + '/' + context + '/' + item,
                        type: 'DELETE'
                    }).fail(function(err) {
                        console.log(err);
                        return false;
                    }).done(function(res) {
                        location.reload();
                    });
                    break;
            }
            break;
    }
});

$(document).on('click', '.uxBlockDialogSubmit[context="salt_minionNewAccount"]', function() {
    var minion = $(this).attr('minion');
    var context = $(this).attr('account_context');
    var kernel = $(this).attr('kernel');
    var formList = $('ul.formInputList[form_name="salt_minionNewAccount"]');
    var formBody = formList.parent();
    var data = {
        kernel: kernel,
        fields: {}
    };
    var submitWait = $('<div>', {class: 'loading_place'});
    $.each($('.formInputListField[form_name="salt_minionNewAccount"]'), function() {
        var field = $(this).attr('field_name');
        var val = $(this).val();
        switch ($(this).attr('type')) {
            case "radio":
            case "checkbox":
                val = $(this).prop('checked');
                break;
        }
        data.fields[field] = val;
    });
    formList.hide(0);
    formBody.append(submitWait);
    $.ajax({
        url: '/api/minions/' + minion + '/' + context,
        contentType: 'application/json',
        data: JSON.stringify(data),
        type: 'POST'
    }).fail(function(err) {
        submitWait.remove();
        formList.show(0);
        console.log(err);
        alert(err.responseText);
        return false;
    }).done(function(res) {
        submitWait.remove();
        formList.show(0);
        location.reload();
        console.log(res);
        salt_loadMinionModPage(minion, context);
        return true;
    });
    console.log(data);
});

$(document).on('click', '.salt_objectItemTagSpanImg', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

$(document).on('click', '.salt_minionServiceCommand', function() {
    var minion = $(this).attr('minion');
    var service = $(this).attr('item_id');
    var command = $(this).attr('cmd').toLowerCase();
    var cmdString = 'service.' + command;
    var cmdIcon = $(this).attr('src');
    var errIcon = '/resource/red_x.png';
    var statIcon = $('.objectItemIcon.salt_minionServiceStatusIcon[item_id="'+$.escapeSelector(service)+'"]');
    $(this).attr('src', '/resource/loading.svg');
    saltCall({
        client: 'local',
        tgt: minion,
        tgt_type: 'glob',
        fun: cmdString,
        kwarg: {
            name: service
        }
    }).fail(() => {
        $(this).attr('src', errIcon);
    }).done(() => {
        $(this).attr('src', cmdIcon);
        switch (command) {
            case 'stop':
                statIcon.attr('src', '/resource/plugins/salt/assets/stop_white.png');
                statIcon.css('background', 'darkred');
                break;
            case 'start':
            case 'restart':
                statIcon.attr('src', '/resource/plugins/salt/assets/play_white.png');
                statIcon.css('background', 'green');
                break;
        }
    });
});
