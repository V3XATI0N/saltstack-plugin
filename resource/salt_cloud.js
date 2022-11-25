function salt_getCloudInstanceState(type, data) {
    let inst_run = false;
    switch (type) {
        case 'vmware':
            if (data.state == "poweredOn") {
                inst_run = true;
            }
            break;
        case 'linode':
            if (data.state == "Running") {
                inst_run = true;
            }
            break;
        case 'vultr':
            if (data.state == "active") {
                inst_run = true;
            }
            break;
    }
    return {
        running: inst_run
    }
}
function salt_loadCloudPage(context) {
    var content = $('#salt_cloud_content_main');
    var wait = $('<div>', { class: 'loading_place' });
    $('.salt_cloudItem').removeClass('activePage');
    $('.salt_cloudItem[cloud_id="'+context+'"]').addClass('activePage');
    content.html(wait);
    switch (context) {
        case 'list':
            content.prepend(pageHeader('Cloud Resource List'));
            let call = {
                client: 'runner',
                fun: 'cloud.full_query'
            }
            saltCall(call)
            .done(function(res) {
                wait.remove();
                $.each(res, function(prov, hosts) {
                    var provTitle = $('<h3>', {
                        class: 'multiListTitle sectionTrigger',
                        section_class: '.cloud_provider_action',
                        item_id: prov,
                        text: 'Provider: ' + prov
                    });
                    var provAction = $('<div>', {
                        class: 'sectionAction cloud_provider_action',
                        item_id: prov,
                    });
                    content.append(provTitle, provAction);
                    $.each(hosts, function(type, typeInstances) {
                        $.ajax({
                            url: '/api/cloud/drivers/' + type,
                            type: 'OPTIONS'
                        }).done((drv) => {
                            //console.log(drv);
                            var typeIcon = $('<img>', {
                                src: '/resource/plugins/salt/assets/cloud_' + type.toLowerCase() + '.png'
                            })
                            var typeTitle = $('<div>', {
                                class: 'salt_sectionTitle',
                                text: type.toUpperCase() + ' INSTANCES'
                            });
                            typeTitle.prepend(typeIcon);
                            var provTools = $('<div>', {
                                class: 'adminNewObjectToolbar'
                            });
                            var provFilter = $('<input>', {
                                type: 'text',
                                class: 'objectListFilter',
                                list_id: 'salt_cloud_list_' + prov,
                                placeholder: 'Filter'
                            });
                            var provAdd = $('<button>', {
                                class: 'salt_cloud_newProviderInstance',
                                item_id: prov,
                                type_id: type,
                                text: 'New ...'
                            });
                            provTools.append(provFilter, provAdd);
                            var hostList = $('<ul>', {
                                id: 'salt_cloud_list_' + prov,
                                class: 'objectList flexGrid halves'
                            });
                            provAction.append(typeTitle, provTools, hostList);
                            $.each(typeInstances, function(hname, hconf) {
                                //console.log(hname, hconf);
                                var inst_state = false;
                                if (hconf[drv.state_field] == drv.online_value) {
                                    inst_state = true;
                                    inst_state_icon = '/resource/plugins/salt/assets/status_green.png';
                                } else {
                                    inst_state = false;
                                    inst_state_icon = '/resource/plugins/salt/assets/status_red.png';
                                }
                                if (drv.name_field == "__id__") {
                                    var inst_name = hname;
                                } else {
                                    var inst_name = hconf[drv.name_field];
                                }
                                var inst_id = hconf[drv.id_field];
                                if (drv.hash_id === true) {
                                    inst_id = btoa(inst_id);
                                }
                                var hItem = $('<li>', {
                                    class: 'objectItem',
                                    item_id: inst_id
                                });
                                var hIcon = $('<img>', {
                                    class: 'objectItemIcon',
                                    src: drv.instance_icon
                                });
                                var hLabel = $('<label>', {
                                    class: 'objectItemLabel actionTrigger',
                                    action_class: '.salt_cloud_instance',
                                    item_id: hconf.id,
                                    text: inst_name
                                });
                                var hTools = $('<div>', {
                                    class: 'objectItemTools'
                                });
                                var hStatusIcon = $('<img>', {
                                    class: 'salt_cloud_instanceStatusIcon',
                                    src: inst_state_icon
                                });
                                hTools.append(hStatusIcon);
                                var hAction = $('<div>', {
                                    class: 'objectAction salt_cloud_instance',
                                    item_id: hconf.id
                                });
                                var hActionData = $('<div>', {
                                    class: 'salt_cloud_instance_data',
                                    text: JSON.stringify(hconf, null, 2)
                                });
                                var hTags = $('<div>', {
                                    class: 'objectItemTag'
                                });
                                hLabel.append(hTags);
                                $.each(drv.tag_items, (tag, tagConf) => {
                                    if (tagConf.online_only === true && inst_state === false) { return; }
                                    var tagBox = $('<div>', {
                                        class: 'salt_objectItemTagSpanImg'
                                    });
                                    var tagImg = $('<img>', {
                                        src: tagConf.icon
                                    });
                                    tagBox.append(tagImg);
                                    var tagSub = $('<div>', {
                                        class: 'salt_objectItemTagSpan_subTag'
                                    });
                                    $.each(tagConf.items, (itemName, itemField) => {
                                        var fieldAddr = itemField.split(':');
                                        if (fieldAddr.length > 1) {
                                            var fseg = hconf[fieldAddr[0]];
                                            var schk = 1;
                                            while (typeof fieldAddr[schk] != "undefined" && typeof fseg[fieldAddr[schk]] != "undefined") {
                                                fseg = fseg[fieldAddr[schk]];
                                                schk++;
                                            }
                                            var subItemValueText = fseg;
                                        } else {
                                            var subItemValueText = hconf[itemField];
                                        }
                                        if (typeof subItemValueText == "object") {
                                            if (Object.prototype.toString.call(subItemValueText) === '[object Array]') {
                                                var subUl = $('<ul>');
                                                $.each(subItemValueText, (i, ii) => {
                                                    subUl.append($('<li>', {
                                                        text: ii
                                                    }));
                                                });
                                                subItemValueText = subUl;
                                            } else {
                                                subItemValueText = JSON.stringify(subItemValueText, null, 2);
                                            }
                                        }

                                        var subItem = $('<span>', {
                                            class: 'salt_objectItemTagSpan_subTagItem'
                                        });
                                        var subItemLabel = $('<div>', {
                                            class: 'salt_subTagLabel',
                                            text: itemName
                                        });
                                        var subItemValue = $('<div>', {
                                            class: 'salt_subTagValue',
                                            html: subItemValueText
                                        });
                                        subItem.append(subItemLabel, subItemValue);
                                        tagSub.append(subItem);
                                    });
                                    tagBox.append(tagSub);
                                    hTags.append(tagBox);
                                });
                                hItem.append(hIcon, hLabel, hTools, hAction.append(hActionData));
                                hostList.append(hItem);
                            });
                        }).fail((err) => {
                            console.log('we do not know how to handle ' + type + ' cloud instances (sad_face.jpeg)');
                        });
                    });
                });
            });
            break;
    }
}
$(document).on('click', '.salt_cloudItem', function() {
    var context = $(this).attr('cloud_id');
    salt_loadCloudPage(context);
});